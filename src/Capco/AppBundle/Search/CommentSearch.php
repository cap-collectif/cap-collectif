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
        $type = $this->index->getType($this->type);
        $totalCount = $type->count($query);
        $query->setFrom($offset);
        $query->setSize($limit);

        return [
            'results' => $this->getHydratedResultsFromResultSet(
                $this->commentRepository,
                $type->search($query)
            ),
            'totalCount' => $totalCount
        ];
    }

    public function getPublicCommentsByAuthor(
        User $author,
        int $limit = 100,
        int $offset = 0
    ): array {
        $query = $this->createPublicCommentsByAuthorQuery($author);
        $type = $this->index->getType($this->type);
        $totalCount = $type->count($query);
        $query->setFrom($offset);
        $query->setSize($limit);

        return [
            'results' => $this->getHydratedResultsFromResultSet(
                $this->commentRepository,
                $type->search($query)
            ),
            'totalCount' => $totalCount
        ];
    }

    public function getCommentsByUser(User $user, int $limit = 100, int $offset = 0): array
    {
        $query = $this->createCommentByUserQuery($user);
        $type = $this->index->getType($this->type);
        $totalCount = $type->count($query);
        $query->setSize($limit);
        $query->setFrom($offset);

        return [
            'results' => $this->getHydratedResultsFromResultSet(
                $this->commentRepository,
                $type->search($query)
            ),
            'totalCount' => $totalCount
        ];
    }

    private function createCommentByUserQuery(User $user): Query
    {
        $boolQuery = new BoolQuery();
        $boolQuery->addMust([
            new Term(['published' => ['value' => true]]),
            new Term(['Author.id' => ['value' => $user->getId()]])
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
                (new BoolQuery())->addMustNot([new Exists('project')]),
                (new BoolQuery())->addMust([
                    new Exists('project'),
                    new Term([
                        'project.visibility' => [
                            'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC
                        ]
                    ]),
                    new Term(['proposal.visible' => ['value' => true]])
                ])
            ]),
            new Term(['published' => ['value' => true]]),
            new Term(['Author.id' => ['value' => $author->getId()]])
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
        $subConditions = [];
        $conditions = [
            new Term(['Author.id' => ['value' => $author->getId()]]),
            new Term(['published' => ['value' => true]])
        ];

        if (!$viewer->isSuperAdmin()) {
            $subConditions = [
                (new BoolQuery())->addMustNot([new Exists('project')]),
                (new BoolQuery())->addShould([
                    new Term([
                        'project.visibility' => [
                            'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC
                        ]
                    ]),
                    new Query\Terms('project.authors.id', [$viewer->getId()])
                ]),
                (new BoolQuery())->addMust([
                    new Term([
                        'project.visibility' => [
                            'value' => ProjectVisibilityMode::VISIBILITY_CUSTOM
                        ]
                    ]),
                    new Query\Terms('project.restrictedViewerIds', [$viewer->getId()])
                ]),
                (new BoolQuery())->addMust([
                    new Query\Terms('project.visibility', $visibility),
                    new Query\Range('project.visibility', [
                        'lt' => ProjectVisibilityMode::VISIBILITY_CUSTOM
                    ])
                ])
            ];
            $conditions = array_merge($conditions, [(new BoolQuery())->addShould($subConditions)]);
        }

        if (!$viewer->isAdmin()) {
            $subConditions = array_merge($subConditions, [
                (new BoolQuery())->addShould([
                    new Term(['proposal.visible' => ['value' => true]]),
                    new Query\Terms('project.authors.id', [$viewer->getId()])
                ])
            ]);
            $conditions = array_merge($conditions, [(new BoolQuery())->addShould($subConditions)]);
        }

        $boolQuery->addMust($conditions);
        $boolQuery->addMustNot(new Exists('trashedStatus'));
        $query = new Query($boolQuery);
        $query->addSort(['createdAt' => ['order' => 'DESC']]);

        return $query;
    }
}
