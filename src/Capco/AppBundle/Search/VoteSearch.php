<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Project;
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
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

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
        ?string $contribuableId,
        int $limit = 100,
        ?string $cursor = null,
        bool $onlyAccounted = false
    ): ElasticsearchPaginatedResult {
        $query = $this->createVotesByAuthorViewerCanSeeQuery(
            $author,
            $viewer,
            $contribuableId,
            $onlyAccounted
        );
        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $response = $this->index->getType($this->type)->search($query);
        $cursors = $this->getCursors($response);

        return $this->getData($cursors, $response);
    }

    public function getVotesByUser(
        User $user,
        int $limit = 100,
        ?string $cursor = null,
        bool $onlyAccounted = false
    ): ElasticsearchPaginatedResult {
        $query = $this->createVotesByUserQuery($user, $onlyAccounted);
        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $response = $this->index->getType($this->type)->search($query);
        $cursors = $this->getCursors($response);

        return $this->getData($cursors, $response);
    }

    public function getPublicVotesByAuthor(
        User $author,
        int $limit = 100,
        ?string $cursor = null,
        bool $onlyAccounted = false
    ): ElasticsearchPaginatedResult {
        $query = $this->createPublicVotesByAuthorQuery($author, $onlyAccounted);
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

    public function getVotesCountsByVersion(string $versionId): ResultSet
    {
        $boolQuery = new BoolQuery();
        $boolQuery
            ->addFilter(new Term(['opinionVersion.id' => $versionId]))
            ->addFilter(new Term(['opinionVersion.published' => true]));

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
        bool $includeUnpublished,
        bool $includeNotAccounted = false
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

            if (!$includeNotAccounted) {
                $boolQuery->addFilter(new Term(['isAccounted' => true]));
            }

            list($cursor, $field, $direction, $limit) = [
                $key['args']->offsetGet('after'),
                $key['args']->offsetGet('orderBy')['field'],
                $key['args']->offsetGet('orderBy')['direction'],
                $key['args']->offsetGet('first'),
            ];

            $query = new Query($boolQuery);
            $this->setSortWithId($query, [
                $this->getSortField($field) => ['order' => $direction],
            ]);
            if ($limit) {
                $query->setSize($limit + 1);
            }
            $this->applyCursor($query, $cursor);

            $searchQuery = $this->index->createSearch($query);
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

    private function createVotesByAuthorViewerCanSeeQuery(
        User $author,
        User $viewer,
        ?string $contribuableId,
        bool $onlyAccounted = false
    ): Query {
        $boolQuery = new BoolQuery();

        if ($contribuableId) {
            $globalId = GlobalId::fromGlobalId($contribuableId);
            list($type, $id) = [$globalId['type'], $globalId['id']];
            if ($type === ucfirst(Project::getElasticsearchTypeName())) {
                $boolQuery
                    ->addFilter(
                        new Query\Term([
                            'project.id' => ['value' => $id],
                        ])
                    )
                    ->addFilter(new Query\Exists('project'));
            } elseif (strpos($type, 'Step')) {
                $boolQuery
                    ->addFilter(
                        new Query\Term([
                            'step.id' => ['value' => $id],
                        ])
                    )
                    ->addFilter(new Query\Exists('step'));
            } else {
                throw new UserError(
                    'The contribuableId "' .
                        $contribuableId .
                        '" does not match any Project or Step.'
                );
            }
        }

        $conditions = [
            new Term(['user.id' => ['value' => $author->getId()]]),
            new Term(['published' => ['value' => true]]),
        ];

        if ($onlyAccounted) {
            $boolQuery->addFilter(new Term(['isAccounted' => ['value' => true]]));
        }

        if ($viewer !== $author && !$viewer->isSuperAdmin()) {
            $conditions[] = new Term(['private' => ['value' => false]]);
            $conditions[] = (new BoolQuery())->addShould([
                (new BoolQuery())
                    ->addMustNot([new Exists('proposal'), new Exists('comment')])
                    ->addFilter(new Exists('project'))
                    ->addFilter(
                        (new BoolQuery())->addShould(
                            $this->getFiltersForProjectViewerCanSee('project', $viewer)
                        )
                    ),
                (new BoolQuery())
                    ->addMustNot(new Exists('comment'))
                    ->addMust(
                        array_merge(
                            [new Exists('proposal')],
                            [
                                (new BoolQuery())->addShould(
                                    $this->getFiltersForProjectViewerCanSee('project', $viewer)
                                ),
                            ],
                            !$viewer->isAdmin()
                                ? [new Term(['proposal.visible' => ['value' => true]])]
                                : []
                        )
                    ),
                (new BoolQuery())
                    ->addFilter(
                        (new BoolQuery())->addShould([
                            (new BoolQuery())->addMust(
                                array_merge(
                                    [
                                        (new BoolQuery())->addShould(
                                            $this->getFiltersForProjectViewerCanSee(
                                                'project',
                                                $viewer
                                            )
                                        ),
                                    ],
                                    !$viewer->isAdmin()
                                        ? [new Term(['proposal.visible' => ['value' => true]])]
                                        : []
                                )
                            ),
                            (new BoolQuery())->addMustNot(new Exists('proposal')),
                        ])
                    )
                    ->addFilter(new Exists('comment'))
                    ->addMustNot(new Exists('comment.trashedStatus')),
            ]);
        }

        foreach ($conditions as $condition) {
            $boolQuery->addFilter($condition);
        }
        $boolQuery->addMustNot(new Exists('comment'));
        $query = new Query($boolQuery);
        $query->addSort(['createdAt' => ['order' => 'DESC'], 'id' => new \stdClass()]);

        return $query;
    }

    private function createPublicVotesByAuthorQuery(
        User $author,
        bool $onlyAccounted = false
    ): Query {
        $boolQuery = new BoolQuery();

        $boolQuery
            ->addFilter(
                (new BoolQuery())->addShould([
                    (new BoolQuery())
                        ->addMustNot([new Exists('proposal'), new Exists('comment')])
                        ->addFilter(new Exists('project'))
                        ->addFilter(
                            new Term([
                                'project.visibility' => [
                                    'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC,
                                ],
                            ])
                        ),
                    (new BoolQuery())
                        ->addMustNot(new Exists('comment'))
                        ->addFilter(new Exists('proposal'))
                        ->addFilter(new Term(['proposal.visible' => ['value' => true]]))
                        ->addFilter(
                            new Term([
                                'project.visibility' => [
                                    'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC,
                                ],
                            ])
                        ),
                    (new BoolQuery())
                        ->addFilter(new Exists('comment'))
                        ->addFilter(
                            (new BoolQuery())->addShould([
                                (new BoolQuery())
                                    ->addFilter(new Term(['proposal.visible' => ['value' => true]]))
                                    ->addFilter(
                                        (new BoolQuery())->addFilter(
                                            new Term([
                                                'project.visibility' => [
                                                    'value' =>
                                                        ProjectVisibilityMode::VISIBILITY_PUBLIC,
                                                ],
                                            ])
                                        )
                                    ),
                                (new BoolQuery())->addMustNot(new Exists('proposal')),
                            ])
                        )
                        ->addMustNot(new Exists('comment.trashedStatus')),
                ])
            )
            ->addFilter(new Term(['published' => ['value' => true]]))
            ->addFilter(new Term(['user.id' => ['value' => $author->getId()]]))
            ->addFilter(new Term(['private' => ['value' => false]]));

        if ($onlyAccounted) {
            $boolQuery->addFilter(new Term(['isAccounted' => ['value' => true]]));
        }
        $query = new Query($boolQuery);
        $query->addSort(['createdAt' => ['order' => 'DESC'], 'id' => new \stdClass()]);

        return $query;
    }

    private function createVotesByUserQuery(User $user, bool $onlyAccounted = false): Query
    {
        $boolQuery = new BoolQuery();
        $boolQuery
            ->addFilter(new Term(['user.id' => ['value' => $user->getId()]]))
            ->addFilter(new Term(['published' => ['value' => true]]));
        if ($onlyAccounted) {
            $boolQuery->addFilter(new Term(['isAccounted' => ['value' => true]]));
        }
        $query = new Query($boolQuery);
        $query->addSort(['createdAt' => ['order' => 'DESC'], 'id' => new \stdClass()]);

        return $query;
    }
}
