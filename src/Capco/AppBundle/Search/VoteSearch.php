<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\UserBundle\Entity\User;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Exists;
use Elastica\Query\Term;
use Elastica\Result;
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
        ?int $offset = 0,
        ?string $cursor = null
    ): array {
        $query = $this->createVotesByAuthorViewerCanSeeQuery($author, $viewer);
        $this->applyCursor($query, $cursor, $offset);
        $query->setSize($limit);
        $response = $this->index->getType($this->type)->search($query);
        $cursors = $this->getCursors($response);

        return $this->getData($cursors, $response);
    }

    public function getVotesByUser(
        User $user,
        int $limit = 100,
        ?int $offset = 0,
        ?string $cursor = null
    ): array {
        $query = $this->createVotesByUserQuery($user);
        $this->applyCursor($query, $cursor, $offset);
        $query->setSize($limit);
        $response = $this->index->getType($this->type)->search($query);
        $cursors = $this->getCursors($response);

        return $this->getData($cursors, $response);
    }

    public function getPublicVotesByAuthor(
        User $author,
        int $limit = 100,
        ?int $offset = 0,
        ?string $cursor = null
    ): array {
        $query = $this->createPublicVotesByAuthorQuery($author);
        $this->applyCursor($query, $cursor, $offset);
        $query->setSize($limit);
        $response = $this->index->getType($this->type)->search($query);
        $cursors = $this->getCursors($response);

        return $this->getData($cursors, $response);
    }

    private function getData(array $cursors, ResultSet $response): array
    {
        return [
            'cursors' => $cursors,
            'results' => $this->getHydratedResultsFromResultSet(
                $this->abstractVoteRepository,
                $response
            ),
            'totalCount' => $response->getTotalHits()
        ];
    }

    private function getCursors(ResultSet $resultSet): array
    {
        return array_map(static function (Result $result) {
            return $result->getParam('sort');
        }, $resultSet->getResults());
    }

    private function applyCursor(Query $query, ?string $cursor, ?int $offset): void
    {
        if ($cursor) {
            $query->setParam('search_after', ElasticsearchPaginator::decodeCursor($cursor));
        } else {
            $offset = $offset ?? 0;
            $query->setFrom($offset);
        }
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
