<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\UserBundle\Entity\User;
use Elastica\Aggregation\Terms;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Exists;
use Elastica\Query\Term;
use Elastica\ResultSet;

class VoteSearch extends Search
{
    private $abstractVoteRepository;

    public function __construct(Index $index, AbstractVoteRepository $abstractVoteRepository)
    {
        parent::__construct($index);
        $this->type = 'vote';
        $this->index = $index;
        $this->abstractVoteRepository = $abstractVoteRepository;
    }

    public function getVotesByAuthorViewerCanSee(
        User $author,
        User $viewer,
        int $limit = 100,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $query = $this->createVotesByAuthorViewerCanSeeQuery($author, $viewer);
        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $response = $this->index->getType($this->type)->search($query);
        $cursors = $this->getCursors($response);

        return $this->getData($cursors, $response);
    }

    public function getVotesByUser(
        User $user,
        int $limit = 100,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $query = $this->createVotesByUserQuery($user);
        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $response = $this->index->getType($this->type)->search($query);
        $cursors = $this->getCursors($response);

        return $this->getData($cursors, $response);
    }

    public function getPublicVotesByAuthor(
        User $author,
        int $limit = 100,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $query = $this->createPublicVotesByAuthorQuery($author);
        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $response = $this->index->getType($this->type)->search($query);
        $cursors = $this->getCursors($response);

        return $this->getData($cursors, $response);
    }

    public function getVotesCountsByOpinion(string $opinionId): ResultSet
    {
        $boolQuery = new BoolQuery();
        $boolQuery
            ->addFilter(new Term(['opinion.id' => $opinionId]))
            ->addFilter(new Term(['opinion.published' => true]));

        $query = new Query($boolQuery);
        $query->setSize(0);
        $agg = new Terms('votesCounts');
        $agg->setField('value')->setSize(Search::BIG_INT_VALUE);
        $query->addAggregation($agg);

        return $this->index->getType($this->type)->search($query);
    }

    public function getSortField(string $field): string
    {
        switch ($field) {
            case 'CREATED_AT':
                return 'createdAt';
            case 'PUBLISHED_AT':
                return 'publishedAt';
            default:
                return 'publishedAt';
        }
    }

    public function searchProposalVotes(
        array $keys,
        bool $includeUnpublished
    ): array {
        $client = $this->index->getClient();
        $globalQuery = new \Elastica\Multi\Search($client);

        foreach ($keys as $key) {
            $boolQuery = new BoolQuery();
            $boolQuery->addFilter(new Term(['proposal.id' => $key['proposal']->getId()]));
            $step = $key['step'] ?? null;
            if ($step) {
                $boolQuery->addFilter(new Term(['step.id' => $step->getId()]));
            }

            if (!$includeUnpublished) {
                $boolQuery->addFilter(new Term(['published' => true]));
            }

            list($cursor, $field, $direction, $limit) = [
                $key['args']->offsetGet('after'),
                $key['args']->offsetGet('orderBy')['field'],
                $key['args']->offsetGet('orderBy')['direction'],
                $key['args']->offsetGet('first')
            ];

            $query = new Query($boolQuery);
            $query->setSort([
                $this->getSortField($field) => ['order' => $direction]
            ]);
            if ($limit) {
                $query->setSize($limit);
            }
            if ($cursor) {
                $this->applyCursor($query, $cursor);
            }

            $searchQuery = new \Elastica\Search($client);
            $searchQuery->addType($this->type);
            $searchQuery->setQuery($query);

            $globalQuery->addSearch($searchQuery);
        }

        $responses = $globalQuery->search();
        $results = [];
        $resultSets = $responses->getResultSets();
        foreach ($resultSets as $key => $resultSet) {
            $results[] = new ElasticsearchPaginatedResult(
                $this->getHydratedResultsFromResultSet($this->abstractVoteRepository, $resultSet),
                $this->getCursors($resultSet),
                $resultSet->getTotalHits()
            );
        }

        return $results;
    }

    private function getData(array $cursors, ResultSet $response): ElasticsearchPaginatedResult
    {
        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($this->abstractVoteRepository, $response),
            $cursors,
            $response->getTotalHits()
        );
    }

    private function createVotesByAuthorViewerCanSeeQuery(User $author, User $viewer): Query
    {
        $boolQuery = new BoolQuery();
        $conditions = [
            new Term(['user.id' => ['value' => $author->getId()]]),
            new Term(['published' => ['value' => true]])
        ];

        if ($viewer !== $author && !$viewer->isSuperAdmin()) {
            $conditions[] = (new BoolQuery())->addShould([
                (new BoolQuery())
                    ->addMustNot([new Exists('proposal'), new Exists('comment')])
                    ->addMust([
                        new Exists('project'),
                        (new BoolQuery())->addShould(
                            $this->getFiltersForProjectViewerCanSee('project', $viewer)
                        )
                    ]),
                (new BoolQuery())
                    ->addMustNot(new Exists('comment'))
                    ->addMust(
                        array_merge(
                            [new Exists('proposal')],
                            [
                                (new BoolQuery())->addShould(
                                    $this->getFiltersForProjectViewerCanSee('project', $viewer)
                                )
                            ],
                            !$viewer->isAdmin()
                                ? [new Term(['proposal.visible' => ['value' => true]])]
                                : []
                        )
                    ),
                (new BoolQuery())
                    ->addMust([
                        new Exists('comment'),
                        (new BoolQuery())->addShould([
                            (new BoolQuery())->addMust(
                                array_merge(
                                    [
                                        (new BoolQuery())->addShould(
                                            $this->getFiltersForProjectViewerCanSee(
                                                'project',
                                                $viewer
                                            )
                                        )
                                    ],
                                    !$viewer->isAdmin()
                                        ? [new Term(['proposal.visible' => ['value' => true]])]
                                        : []
                                )
                            ),
                            (new BoolQuery())->addMustNot(new Exists('proposal'))
                        ])
                    ])
                    ->addMustNot(new Exists('comment.trashedStatus'))
            ]);
        }

        $boolQuery->addMust($conditions);
        $query = new Query($boolQuery);
        $query->addSort(['createdAt' => ['order' => 'DESC'], 'id' => new \stdClass()]);

        return $query;
    }

    private function createPublicVotesByAuthorQuery(User $author): Query
    {
        $boolQuery = new BoolQuery();

        $boolQuery->addMust([
            (new BoolQuery())->addShould([
                (new BoolQuery())
                    ->addMustNot([new Exists('proposal'), new Exists('comment')])
                    ->addMust([
                        new Exists('project'),
                        new Term([
                            'project.visibility' => [
                                'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC
                            ]
                        ])
                    ]),
                (new BoolQuery())->addMustNot(new Exists('comment'))->addMust([
                    new Exists('proposal'),
                    new Term([
                        'project.visibility' => [
                            'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC
                        ]
                    ]),
                    new Term(['proposal.visible' => ['value' => true]])
                ]),
                (new BoolQuery())
                    ->addMust([
                        new Exists('comment'),
                        (new BoolQuery())->addShould([
                            (new BoolQuery())->addMust([
                                (new BoolQuery())->addMust(
                                    new Term([
                                        'project.visibility' => [
                                            'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC
                                        ]
                                    ])
                                ),
                                new Term(['proposal.visible' => ['value' => true]])
                            ]),
                            (new BoolQuery())->addMustNot(new Exists('proposal'))
                        ])
                    ])
                    ->addMustNot(new Exists('comment.trashedStatus'))
            ]),
            new Term(['published' => ['value' => true]]),
            new Term(['user.id' => ['value' => $author->getId()]])
        ]);

        $query = new Query($boolQuery);
        $query->addSort(['createdAt' => ['order' => 'DESC'], 'id' => new \stdClass()]);

        return $query;
    }

    private function createVotesByUserQuery(User $user): Query
    {
        $boolQuery = new BoolQuery();
        $boolQuery->addMust([
            new Term(['published' => ['value' => true]]),
            new Term(['user.id' => ['value' => $user->getId()]])
        ]);
        $query = new Query($boolQuery);
        $query->addSort(['createdAt' => ['order' => 'DESC'], 'id' => new \stdClass()]);

        return $query;
    }
}
