<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\UserBundle\Entity\User;
use Elastica\Index;
use Elastica\Query;

class CommentSearch extends Search
{
    public function __construct(Index $index)
    {
        parent::__construct($index);
        $this->type = 'comment';
        $this->index = $index;
    }

    public function getCommentsByAuthorViewerCanSee(
        User $author,
        User $viewer,
        int $limit = null,
        int $offset = null
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
        $boolQuery->addMust([
            (new Query\BoolQuery())->addShould([
                (new Query\BoolQuery())->addShould([
                    new Query\Term([
                        'project.visibility' => [
                            'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC
                        ]
                    ]),
                    (new Query\BoolQuery())->addMustNot([new Query\Exists('project')])
                ]),
                (new Query\BoolQuery())->addMust([
                    new Query\Term([
                        'project.visibility' => [
                            'value' => ProjectVisibilityMode::VISIBILITY_CUSTOM
                        ]
                    ]),
                    new Query\Term([
                        'project.restrictedViewerIds' => ['value' => $viewer->getUserGroupIds()]
                    ])
                ]),
                (new Query\BoolQuery())->addMust([
                    new Query\Term(['project.visibility' => ['value' => $visibility]]),
                    new Query\Range('project.visibility', [
                        'lt' => ProjectVisibilityMode::VISIBILITY_CUSTOM
                    ])
                ])
            ]),
            new Query\Term(['Author.id' => ['value' => $author->getId()]])
        ]);
        $boolQuery->addMustNot(new Query\Exists('trashedStatus'));

        $query = new Query($boolQuery);

        return [
            'results' => $this->index->getType($this->type)->search($query)
        ];
    }
}
