<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\UserBundle\Entity\User;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Exists;
use Elastica\Query\Term;

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
        int $offset = 0
    ): array {
        $query = $this->createVotesByAuthorViewerCanSeeQuery($author, $viewer);
        $query->setSize($limit);
        $query->setFrom($offset);
        $response = $this->index->getType($this->type)->search($query);

        return [
            'results' => $this->getHydratedResultsFromResultSet(
                $this->abstractVoteRepository,
                $response
            ),
            'totalCount' => $response->getTotalHits()
        ];
    }

    public function getPublicVotesByAuthor(User $author, int $limit = 100, int $offset = 0): array
    {
        $query = $this->createPublicVotesByAuthorQuery($author);
        $query->setSize($limit);
        $query->setFrom($offset);
        $response = $this->index->getType($this->type)->search($query);

        return [
            'results' => $this->getHydratedResultsFromResultSet(
                $this->abstractVoteRepository,
                $response
            ),
            'totalCount' => $response->getTotalHits()
        ];
    }

    private function createVotesByAuthorViewerCanSeeQuery(User $author, User $viewer): Query
    {
        $boolQuery = new BoolQuery();
        $subConditions = [];
        $conditions = [
            new Term(['user.id' => ['value' => $author->getId()]]),
            new Term(['published' => ['value' => true]])
        ];

        if (!$viewer->isSuperAdmin()) {
        }

        if (!$viewer->isAdmin()) {
        }

        $boolQuery->addMust($conditions);
        $query = new Query($boolQuery);
        $query->addSort(['createdAt' => ['order' => 'DESC']]);

        return $query;
    }

    private function createPublicVotesByAuthorQuery(User $author): Query
    {
        $boolQuery = new BoolQuery();
        $boolQuery->addMust([
            (new BoolQuery())->addShould([
                (new BoolQuery())->addMustNot([new Exists('project'), new Exists('proposal')]),
                (new BoolQuery())->addMust([
                    new Exists('project'),
                    new Exists('proposal'),
                    new Term([
                        'project.visibility' => [
                            'value' => ProjectVisibilityMode::VISIBILITY_PUBLIC
                        ]
                    ]),
                    new Term(['proposal.visible' => ['value' => true]])
                ])
            ]),
            new Term(['published' => ['value' => true]]),
            new Term(['user.id' => ['value' => $author->getId()]])
        ]);
        $query = new Query($boolQuery);
        $query->addSort(['createdAt' => ['order' => 'DESC']]);

        return $query;
    }
}
