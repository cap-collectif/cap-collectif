<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\UserBundle\Entity\User;
use Elastica\Index;
use Elastica\Query;

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
        $visibility = [];
        $visibility[] = ProjectVisibilityMode::VISIBILITY_PUBLIC;
        if ($viewer->isSuperAdmin()) {
            $visibility[] = ProjectVisibilityMode::VISIBILITY_ME;
            $visibility[] = ProjectVisibilityMode::VISIBILITY_ADMIN;
            $visibility[] = ProjectVisibilityMode::VISIBILITY_CUSTOM;
        } elseif ($viewer->isAdmin()) {
            $visibility[] = ProjectVisibilityMode::VISIBILITY_ADMIN;
        }

        $boolQuery = new Query\BoolQuery();

        $subConditions = [];
        $conditions = [
            new Query\Term(['Author.id' => ['value' => $author->getId()]]),
            new Query\Term(['published' => ['value' => true]])
        ];

        if (!$viewer->isSuperAdmin()) {
            $subConditions = [
                (new Query\BoolQuery())->addMustNot([new Query\Exists('project')]),
                (new Query\BoolQuery())->addShould([
                    new Query\Term([
                        'project.visibility' => [
                            'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC
                        ]
                    ]),
                    new Query\Terms('project.authors.id', [$viewer->getId()])
                ]),
                (new Query\BoolQuery())->addMust([
                    new Query\Term([
                        'project.visibility' => [
                            'value' => ProjectVisibilityMode::VISIBILITY_CUSTOM
                        ]
                    ]),
                    new Query\Terms('project.restrictedViewerIds', $viewer->getUserGroupIds())
                ]),
                (new Query\BoolQuery())->addMust([
                    new Query\Terms('project.visibility', $visibility),
                    new Query\Range('project.visibility', [
                        'lt' => ProjectVisibilityMode::VISIBILITY_CUSTOM
                    ])
                ])
            ];
            $conditions = array_merge($conditions, [
                (new Query\BoolQuery())->addShould($subConditions)
            ]);
        }

        if (!$viewer->isAdmin()) {
            $subConditions = array_merge($subConditions, [
                (new Query\BoolQuery())->addShould([
                    new Query\Term(['proposal.visible' => ['value' => true]]),
                    new Query\Terms('project.authors.id', [$viewer->getId()])
                ])
            ]);
            $conditions = array_merge($conditions, [
                (new Query\BoolQuery())->addShould($subConditions)
            ]);
        }

        $boolQuery->addMust($conditions);
        $boolQuery->addMustNot(new Query\Exists('trashedStatus'));

        $query = new Query($boolQuery);
        $query->setFrom($offset);
        $query->setSize($limit);

        return [
            'results' => $this->getHydratedResultsFromResultSet(
                $this->commentRepository,
                $this->index->getType($this->type)->search($query)
            )
        ];
    }

    public function getPublicCommentsByAuthor(
        User $author,
        int $limit = null,
        int $offset = null
    ): array {
        $boolQuery = new Query\BoolQuery();
        $boolQuery->addMust([
            (new Query\BoolQuery())->addShould([
                (new Query\BoolQuery())->addMustNot([new Query\Exists('project')]),
                (new Query\BoolQuery())->addMust([
                    new Query\Exists('project'),
                    new Query\Term([
                        'project.visibility' => [
                            'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC
                        ]
                    ]),
                    new Query\Term(['proposal.visible' => ['value' => true]])
                ])
            ]),
            new Query\Term(['published' => ['value' => true]]),
            new Query\Term(['Author.id' => ['value' => $author->getId()]])
        ]);
        $boolQuery->addMustNot([new Query\Exists('trashedStatus')]);

        $query = new Query($boolQuery);
        $query->setFrom($offset);
        $query->setSize($limit);

        return [
            'results' => $this->getHydratedResultsFromResultSet(
                $this->commentRepository,
                $this->index->getType($this->type)->search($query)
            )
        ];
    }
}
