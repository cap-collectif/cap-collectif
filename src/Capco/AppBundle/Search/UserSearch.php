<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Enum\SortField;
use Capco\AppBundle\Enum\UserOrderField;
use Capco\UserBundle\Entity\UserType;
use Capco\UserBundle\Repository\UserRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\Range;
use Elastica\Query\Term;
use Elastica\ResultSet;

class UserSearch extends Search
{
    public const SEARCH_FIELDS = ['username', 'username.std'];

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
        ?string $sort = null,
        $type = null
    ): array {
        $boolQuery = new Query\BoolQuery();
        if (null !== $type && UserType::FILTER_ALL !== $type) {
            $boolQuery->addMust(new Term(['userType.id' => ['value' => $type->getId()]]));
        }
        $query = new Query();
        $query->setQuery($boolQuery);
        if ('activity' === $sort) {
            $query->setSort([
                'totalParticipationsCount' => [
                    'order' => 'DESC',
                ],
                'createdAt' => [
                    'order' => 'desc',
                ],
            ]);
        } else {
            $query->addSort([
                'createdAt' => ['order' => 'DESC'],
            ]);
        }

        if ($pagination > 0) {
            $query->setFrom(($page - 1) * $pagination)->setSize($pagination);
        }

        $resultSet = $this->index->getType($this->type)->search($query);

        return [
            'results' => $this->getHydratedResultsFromResultSet($this->userRepo, $resultSet),
            'totalCount' => $resultSet->getTotalHits(),
        ];
    }

    public function getAllUsers(
        int $limit,
        array $orderBy,
        ?string $cursor = null,
        bool $showSuperAdmin = false
    ): ElasticsearchPaginatedResult {
        $boolQuery = new Query\BoolQuery();
        if (!$showSuperAdmin) {
            $queryString = new Query\QueryString();
            $queryString->setQuery('ROLE_SUPER_ADMIN');
            $queryString->setFields(['roles']);
            $boolQuery->addMustNot($queryString);
        }
        $query = new Query();
        $query->setQuery($boolQuery);
        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $query->addSort($this->getSort($orderBy));
        $response = $this->index->getType('user')->search($query);
        $cursors = $this->getCursors($response);

        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($this->userRepo, $response),
            $cursors,
            $response->getTotalHits()
        );
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
            $users = $this->getHydratedResults($this->userRepo, $authorIds);

            if ($onlyUsers) {
                return $users;
            }

            return [
                'users' => $users,
                'count' => \count($authorIds),
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

        if (null !== $notInIds && \count($notInIds) > 0) {
            $query = $this->searchNotInTermsForField($query, 'id', $notInIds);
        }

        $resultSet = $this->index->getType($this->type)->search($query);
        $users = $this->getHydratedResultsFromResultSet($this->userRepo, $resultSet);

        if ($onlyUsers) {
            return $users;
        }

        return [
            'users' => $users,
            'count' => $resultSet->getTotalHits(),
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
        $users = $this->getHydratedResultsFromResultSet($this->userRepo, $resultSet);

        if ($onlyUsers) {
            return $users;
        }

        return [
            'users' => $users,
            'count' => $resultSet->getTotalHits(),
        ];
    }

    public function getContributorByProject(
        Project $project,
        array $orderBy,
        array $providedFilters = [],
        int $limit = 100,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $sort = [];
        $boolQuery = new Query\BoolQuery();
        if (isset($providedFilters['step'])) {
            $nestedQueryStep = new Query\Nested();
            $nestedQueryStep->setPath('participationsCountByStep');
            $nestedQueryStep->setQuery(
                (new Query\BoolQuery())->addFilter(
                    new Term(['participationsCountByStep.step.id' => $providedFilters['step']])
                )
            );
            $boolQuery->addFilter($nestedQueryStep);
            if (!empty($orderBy) && UserOrderField::ACTIVITY === $orderBy['field']) {
                $sort = [
                    'participationsCountByStep.count' => [
                        'order' => strtolower($orderBy['direction']),
                        'nested_path' => 'participationsCountByStep',
                        'nested_filter' => [
                            'term' => [
                                'participationsCountByStep.step.id' => $providedFilters['step'],
                            ],
                        ],
                    ],
                ];
            }
        }

        if (isset($providedFilters['vip'])) {
            $boolQuery->addFilter(new Term(['vip' => $providedFilters['vip']]));
        }

        if (isset($providedFilters['userType'])) {
            $boolQuery->addFilter(new Term(['userType.id' => $providedFilters['userType']]));
        }

        $nestedQueryProject = new Query\Nested();
        $nestedQueryProject->setPath('participationsCountByProject');
        $nestedQueryProject->setQuery(
            (new Query\BoolQuery())->addFilter(
                new Query\Term(['participationsCountByProject.project.id' => $project->getId()])
            )
            // No need to add the range query because the participationsCountByProject is added if only there is a contribution.
        );

        $boolQuery->addFilter($nestedQueryProject);
        $query = new Query($boolQuery);
        if (empty($sort) && !empty($orderBy) && UserOrderField::ACTIVITY === $orderBy['field']) {
            $sort = [
                'participationsCountByProject.count' => [
                    'order' => strtolower($orderBy['direction']),
                    'nested_path' => 'participationsCountByProject',
                    'nested_filter' => [
                        'term' => ['participationsCountByProject.project.id' => $project->getId()],
                    ],
                ],
            ];
        }

        $query->setSort(
            array_merge($sort, [
                'createdAt' => [
                    'order' => 'desc',
                ],
                'id' => new \stdClass(),
            ])
        );
        $this->applyCursor($query, $cursor);
        $query->setSource(['id'])->setSize($limit);
        $resultSet = $this->index->getType($this->type)->search($query);
        $cursors = $this->getCursors($resultSet);

        return $this->getData($cursors, $resultSet);
    }

    public function getContributorByStep(
        AbstractStep $step,
        int $limit = 100,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $nestedQuery = new Query\Nested();
        $nestedQuery->setPath('participationsCountByStep');
        $boolQuery = new Query\BoolQuery();
        $boolQuery->addFilter(new Term(['participationsCountByStep.step.id' => $step->getId()]));
        $boolQuery->addFilter(new Range('participationsCountByStep.count', ['gt' => 0]));
        $nestedQuery->setQuery($boolQuery);
        $query = new Query($nestedQuery);
        $query->setSort([
            'participationsCountByStep.count' => [
                'order' => 'desc',
                'nested_path' => 'participationsCountByStep',
                'nested_filter' => [
                    'term' => ['participationsCountByStep.step.id' => $step->getId()],
                ],
            ],
            'createdAt' => [
                'order' => 'desc',
            ],
        ]);

        if ($limit) {
            $query->setSize($limit);
        }

        $this->applyCursor($query, $cursor);
        $query->setSource(['id']);
        $resultSet = $this->index->getType($this->type)->search($query);
        $cursors = $this->getCursors($resultSet);

        return $this->getData($cursors, $resultSet);
    }

    public function getContributorsByConsultation(
        Consultation $consultation,
        int $limit,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $nestedQuery = new Query\Nested();
        $nestedQuery->setPath('participationsCountByConsultation');
        $boolQuery = new Query\BoolQuery();
        $boolQuery->addFilter(
            new Term([
                'participationsCountByConsultation.consultation.id' => $consultation->getId(),
            ])
        );
        $boolQuery->addFilter(new Range('participationsCountByConsultation.count', ['gt' => 0]));
        $nestedQuery->setQuery($boolQuery);
        $query = new Query($nestedQuery);

        $query->setSort([
            'createdAt' => [
                'order' => 'desc',
            ],
        ]);

        $this->applyCursor($query, $cursor);
        $query->setSource(['id'])->setSize($limit);
        $resultSet = $this->index->getType($this->type)->search($query);
        $cursors = $this->getCursors($resultSet);

        return $this->getData($cursors, $resultSet);
    }

    public function getAllContributors(int $offset, int $limit): array
    {
        $boolQuery = new Query\BoolQuery();
        $boolQuery->addMust(new Range('totalParticipationsCount', ['gt' => 0]));

        $query = new Query($boolQuery);
        $query->setSort([
            'totalParticipationsCount' => [
                'order' => 'desc',
            ],
            'createdAt' => [
                'order' => 'desc',
            ],
        ]);

        $query
            ->setFrom($offset)
            ->setSize($limit)
            ->setSource(['id']);

        $resultSet = $this->index->getType('user')->search($query);

        return [
            'results' => $this->getHydratedResultsFromResultSet($this->userRepo, $resultSet),
            'totalCount' => $resultSet->getTotalHits(),
        ];
    }

    private function getData(array $cursors, ResultSet $response): ElasticsearchPaginatedResult
    {
        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($this->userRepo, $response),
            $cursors,
            $response->getTotalHits()
        );
    }

    private function getSort(array $orderBy): array
    {
        switch ($orderBy['field']) {
            case SortField::CREATED_AT:
                $sortField = SortField::SORT_FIELD[SortField::CREATED_AT];

                break;
            default:
                throw new \RuntimeException("Unknown order: ${orderBy}");

                break;
        }

        return [$sortField => ['order' => $orderBy['direction']], 'id' => new \stdClass()];
    }
}
