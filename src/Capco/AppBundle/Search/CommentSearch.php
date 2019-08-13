<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\UserBundle\Entity\User;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Exists;
use Elastica\Query\Term;

class CommentSearch extends Search
{
    private $commentRepository;

    public function __construct(Index $index, CommentRepository $commentRepository)
    {
        parent::__construct($index);
        $this->type = 'comment';
        $this->index = $index;
        $this->commentRepository = $commentRepository;
    }

    public function getCommentsByAuthorViewerCanSee(
        User $author,
        User $viewer,
        int $limit = 100,
        int $offset = 0
    ): array {
        $query = $this->createCommentsByAuthorViewerCanSeeQuery($author, $viewer);
        $query->setFrom($offset);
        $query->setSize($limit);
        $response = $this->index->getType($this->type)->search($query);

        return [
            'results' => $this->getHydratedResultsFromResultSet(
                $this->commentRepository,
                $response
            ),
            'totalCount' => $response->getTotalHits()
        ];
    }

    public function getPublicCommentsByAuthor(
        User $author,
        int $limit = 100,
        int $offset = 0
    ): array {
        $query = $this->createPublicCommentsByAuthorQuery($author);
        $query->setFrom($offset);
        $query->setSize($limit);
        $response = $this->index->getType($this->type)->search($query);

        return [
            'results' => $this->getHydratedResultsFromResultSet(
                $this->commentRepository,
                $response
            ),
            'totalCount' => $response->getTotalHits()
        ];
    }

    public function getCommentsByUser(User $user, int $limit = 100, int $offset = 0): array
    {
        $query = $this->createCommentByUserQuery($user);
        $query->setSize($limit);
        $query->setFrom($offset);
        $response = $this->index->getType($this->type)->search($query);

        return [
            'results' => $this->getHydratedResultsFromResultSet(
                $this->commentRepository,
                $response
            ),
            'totalCount' => $response->getTotalHits()
        ];
    }

    private function createCommentByUserQuery(User $user): Query
    {
        $boolQuery = new BoolQuery();
        $boolQuery->addMust([
            new Term(['published' => ['value' => true]]),
            new Term(['author.id' => ['value' => $user->getId()]])
        ]);
        $query = new Query($boolQuery);
        $query->addSort(['createdAt' => ['order' => 'DESC']]);

        return $query;
    }

    private function createPublicCommentsByAuthorQuery(User $author): Query
    {
        $boolQuery = new BoolQuery();
        $boolQuery->addMust([
            (new BoolQuery())->addShould([
                (new BoolQuery())->addMustNot([new Exists('proposal')]),
                (new BoolQuery())->addMust([
                    new Term([
                        'project.visibility' => [
                            'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC
                        ]
                    ]),
                    new Term(['proposal.visible' => ['value' => true]])
                ])
            ]),
            (new BoolQuery())->addShould([
                (new BoolQuery())->addMustNot([new Exists('proposal')]),
                new Term(['proposal.visible' => ['value' => true]])
            ]),
            new Term(['published' => ['value' => true]]),
            new Term(['author.id' => ['value' => $author->getId()]])
        ]);
        $boolQuery->addMustNot([new Exists('trashedStatus')]);
        $query = new Query($boolQuery);
        $query->addSort(['createdAt' => ['order' => 'DESC']]);

        return $query;
    }

    private function createCommentsByAuthorViewerCanSeeQuery(User $author, User $viewer): Query
    {
        $visibility = ProjectVisibilityMode::getProjectVisibilityByRoles($viewer);
        $boolQuery = new BoolQuery();
        $conditions = [
            new Term(['author.id' => ['value' => $author->getId()]]),
            new Term(['published' => ['value' => true]])
        ];

        if ($viewer !== $author) {
            if (!$viewer->isSuperAdmin()) {
                $subConditions = [
                    (new BoolQuery())->addMustNot([new Exists('proposal')]),
                    (new BoolQuery())->addShould([
                        new Term([
                            'proposal.project.visibility' => [
                                'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC
                            ]
                        ]),
                        new Query\Terms('proposal.project.authors.id', [$viewer->getId()])
                    ]),
                    (new BoolQuery())->addMust([
                        new Term([
                            'proposal.project.visibility' => [
                                'value' => ProjectVisibilityMode::VISIBILITY_CUSTOM
                            ]
                        ]),
                        new Query\Terms('proposal.project.restrictedViewerIds', [$viewer->getId()])
                    ]),
                    (new BoolQuery())->addMust([
                        new Query\Terms('proposal.project.visibility', $visibility),
                        new Query\Range('proposal.project.visibility', [
                            'lt' => ProjectVisibilityMode::VISIBILITY_CUSTOM
                        ])
                    ])
                ];
                $conditions[] = [(new BoolQuery())->addShould($subConditions)];
            }

            if (!$viewer->isAdmin()) {
                $conditions[] = [
                    (new BoolQuery())->addShould([
                        (new BoolQuery())->addMustNot([new Exists('proposal')]),
                        new Term(['proposal.visible' => ['value' => true]]),
                        new Query\Terms('proposal.project.authors.id', [$viewer->getId()])
                    ])
                ];
            }
        }

        $boolQuery->addMust($conditions);
        $boolQuery->addMustNot(new Exists('trashedStatus'));
        $query = new Query($boolQuery);
        $query->addSort(['createdAt' => ['order' => 'DESC']]);

        return $query;
    }
}
