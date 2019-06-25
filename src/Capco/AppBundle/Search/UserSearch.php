<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\UserBundle\Entity\UserType;
use Capco\UserBundle\Repository\UserRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\Range;
use Elastica\Query\Term;
use Elastica\Result;
use Elastica\ResultSet;

class UserSearch extends Search
{
    const SEARCH_FIELDS = ['username', 'username.std'];

    private $userRepo;
    private $eventSearch;

    public function __construct(Index $index, UserRepository $userRepo, EventSearch $eventSearch)
    {
        parent::__construct($index);
        $this->userRepo = $userRepo;
        $this->eventSearch = $eventSearch;
        $this->type = 'user';
    }

    public function getRegisteredUsers(
        int $pagination,
        int $page,
        string $sort = null,
        $type = null
    ) {
        $nestedQuery = new Query\Nested();
        $nestedQuery->setPath('totalContributionsCount');

        $query = new Query($nestedQuery);
        if (!$sort || 'activity' === $sort) {
            $query->setSort([
                'totalContributionsCount.count' => [
                    'order' => 'desc'
                ]
            ]);
        } else {
            $query->addSort([
                'createdAt' => ['order' => 'ASC']
            ]);
        }

        if (null !== $type && UserType::FILTER_ALL !== $type) {
            $boolQuery = new Query\BoolQuery();
            $boolQuery->addFilter(new Term(['user_type.id' => $type->getId()]));
            $nestedQuery->setQuery($boolQuery);
        }

        $resultSet = $this->index->getType('user')->search($query);

        if ($pagination > 0) {
            $query->setFrom(($page - 1) * $pagination)->setSize($pagination);
        }

        return [
            'results' => $this->getHydratedResults($resultSet->getResults()),
            'totalCount' => $resultSet->getTotalHits()
        ];
    }

    public function searchAllUsers(
        $terms = null,
        ?array $notInIds = [],
        bool $authorsOfEventOnly = false,
        bool $onlyUsers = false
    ): array {
        $query = new Query\BoolQuery();

        if ($terms && $authorsOfEventOnly) {
            $authorIds = $this->eventSearch->getAllIdsOfAuthorOfEvent($terms);
            $users = $this->getHydratedResults($authorIds);

            if ($onlyUsers) {
                return $users;
            }

            return [
                'users' => $users,
                'count' => \count($authorIds)
            ];
        }

        if ($terms) {
            $query = $this->searchTermsInMultipleFields(
                $query,
                self::SEARCH_FIELDS,
                $terms,
                'phrase_prefix'
            );
        }

        if (\count($notInIds) > 0) {
            $query = $this->searchNotInTermsForField($query, 'id', $notInIds);
        }

        $resultSet = $this->index->getType($this->type)->search($query);
        $users = $this->getHydratedResultsFromResultSet($resultSet);

        if ($onlyUsers) {
            return $users;
        }

        return [
            'users' => $users,
            'count' => $resultSet->getTotalHits()
        ];
    }

    public function searchUsers(
        $terms = null,
        ?array $fields = [],
        ?array $notInIds = [],
        bool $onlyUsers = false
    ): array {
        $query = new Query\BoolQuery();

        if ($terms) {
            $query = $this->searchTermsInMultipleFields($query, $fields, $terms, 'best_fields');
        }
        if (\count($notInIds) > 0) {
            $query = $this->searchNotInTermsForField($query, 'id', $notInIds);
        }

        $resultSet = $this->index->getType($this->type)->search($query, 300);
        $users = $this->getHydratedResultsFromResultSet($resultSet);

        if ($onlyUsers) {
            return $users;
        }

        return [
            'users' => $users,
            'count' => $resultSet->getTotalHits()
        ];
    }

    public function getContributorByProject(Project $project, int $offset, int $limit): array
    {
        $nestedQuery = new Query\Nested();
        $nestedQuery->setPath('contributionsCountByProject');

        $boolQuery = new Query\BoolQuery();
        $boolQuery->addMust(
            new Term(['contributionsCountByProject.project.id' => $project->getId()])
        );
        $boolQuery->addMust(new Range('contributionsCountByProject.count', ['gt' => 0]));

        $nestedQuery->setQuery($boolQuery);

        $query = new Query($nestedQuery);
        $query->setSort([
            'contributionsCountByProject.count' => [
                'order' => 'desc',
                'nested_filter' => [
                    'term' => ['contributionsCountByProject.project.id' => $project->getId()]
                ]
            ]
        ]);

        $query
            ->setSource(['id'])
            ->setFrom($offset)
            ->setSize($limit);
        $resultSet = $this->index->getType($this->type)->search($query);
        $users = $this->getHydratedResultsFromResultSet($resultSet);

        return [
            'results' => $users,
            'totalCount' => $resultSet->getTotalHits()
        ];
    }

    public function getContributorByStep(AbstractStep $step, int $offset, int $limit): array
    {
        $nestedQuery = new Query\Nested();
        $nestedQuery->setPath('contributionsCountByStep');

        $boolQuery = new Query\BoolQuery();
        $boolQuery->addMust(new Term(['contributionsCountByStep.step.id' => $step->getId()]));
        $boolQuery->addMust(new Range('contributionsCountByStep.count', ['gt' => 0]));

        $nestedQuery->setQuery($boolQuery);

        $query = new Query($nestedQuery);

        $query->setSort([
            'createdAt' => [
                'order' => 'desc',
            ],
        ]);

        // Unstable sort by top contributors.
        // It will be used in the future for projects counters.
        // $query->setSort([
        //     'contributionsCountByStep.count' => [
        //         'order' => 'desc',
        //         'nested_filter' => [
        //             'term' => ['contributionsCountByStep.step.id' => $step->getId()],
        //         ],
        //     ],
        // ]);

        $query
            ->setSource(['id'])
            ->setFrom($offset)
            ->setSize($limit);

        $resultSet = $this->index->getType($this->type)->search($query);
        $users = $this->getHydratedResultsFromResultSet($resultSet);

        return [
            'results' => $users,
            'totalCount' => $resultSet->getTotalHits()
        ];
    }

    public function getAllContributors(int $offset, int $limit): array
    {
        $nestedQuery = new Query\Nested();
        $nestedQuery->setPath('totalContributionsCount');

        $boolQuery = new Query\BoolQuery();
        $boolQuery->addMust(new Range('totalContributionsCount.count', ['gt' => 0]));

        $nestedQuery->setQuery($boolQuery);

        $query = new Query($nestedQuery);
        $query->setSort([
            'totalContributionsCount.count' => [
                'order' => 'desc'
            ]
        ]);

        $query->setFrom($offset)->setSize($limit);

        $resultSet = $this->index->getType('user')->search($query);

        return [
            'results' => $this->getHydratedResults($resultSet->getResults()),
            'totalCount' => $resultSet->getTotalHits()
        ];
    }

    private function getHydratedResultsFromResultSet(ResultSet $resultSet): array
    {
        $ids = array_map(function (Result $result) {
            return $result->getData()['id'];
        }, $resultSet->getResults());

        return $this->getHydratedResults($ids);
    }

    private function getHydratedResults(array $ids): array
    {
        if (isset($ids[0]) && !\is_string($ids[0])) {
            $ids = array_map(function (Result $result) {
                return $result->getData()['id'];
            }, $ids);
        }

        // We can't use findById because we would lost the correct order given by ES
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        $users = $this->userRepo->hydrateFromIds($ids);

        // We have to restore the correct order of ids, because Doctrine has lost it, see:
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        usort($users, function ($a, $b) use ($ids) {
            return array_search($a->getId(), $ids, false) > array_search($b->getId(), $ids, false);
        });

        return $users;
    }
}
