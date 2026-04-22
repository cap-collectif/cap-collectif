<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\SortField;
use Capco\AppBundle\Enum\UserOrderField;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\UserBundle\Repository\UserRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Range;
use Elastica\Query\Term;
use Elastica\ResultSet;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class ContributorSearch extends Search
{
    public function __construct(
        Index $index,
        private readonly UserRepository $userRepository,
        private readonly ParticipantRepository $participantRepository,
        private readonly AuthorizationCheckerInterface $authorizationChecker
    ) {
        parent::__construct($index);
    }

    /**
     * @param array<string, mixed> $orderBy
     * @param array<string, mixed> $providedFilters
     */
    public function getContributorsByProject(
        Project $project,
        array $orderBy,
        array $providedFilters = [],
        int $limit = 100,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $sort = [];
        $boolQuery = new BoolQuery();

        // Query both user and participant types
        // For users: require enabled=true
        // For participants: no such requirement (they don't have enabled field)
        $userCondition = (new BoolQuery())
            ->addFilter(new Term(['objectType' => 'user']))
            ->addFilter(new Term(['enabled' => true]))
        ;

        $participantCondition = (new BoolQuery())
            ->addFilter(new Term(['objectType' => 'participant']))
        ;

        $typeConditions = (new BoolQuery())
            ->addShould($userCondition)
            ->addShould($participantCondition)
            ->setMinimumShouldMatch(1)
        ;

        $boolQuery->addFilter($typeConditions);

        if (isset($providedFilters['step'])) {
            $nestedQueryStep = new Query\Nested();
            $nestedQueryStep->setPath('participationsCountByStep');
            $nestedQueryStep->setQuery(
                (new BoolQuery())
                    ->addFilter(
                        new Term(['participationsCountByStep.step.id' => $providedFilters['step']])
                    )
                    ->addFilter(new Range('participationsCountByStep.count', ['gt' => 0]))
            );
            $boolQuery->addFilter($nestedQueryStep);
            if (
                !empty($orderBy)
                && $orderBy['direction']
                && UserOrderField::ACTIVITY === $orderBy['field']
            ) {
                $sort = [
                    'participationsCountByStep.count' => [
                        'order' => strtolower((string) $orderBy['direction']),
                        'nested' => [
                            'path' => 'participationsCountByStep',
                            'filter' => [
                                'term' => [
                                    'participationsCountByStep.step.id' => $providedFilters['step'],
                                ],
                            ],
                        ],
                    ],
                    '_id' => new \stdClass(),
                ];
            }
        } else {
            $nestedQueryProject = new Query\Nested();
            $nestedQueryProject->setPath('participationsCountByProject');
            $nestedQueryProject->setQuery(
                (new BoolQuery())
                    ->addFilter(
                        new Term([
                            'participationsCountByProject.project.id' => $project->getId(),
                        ])
                    )
                    ->addFilter(new Range('participationsCountByProject.count', ['gt' => 0]))
            );

            $boolQuery->addFilter($nestedQueryProject);
        }

        // Add search query that matches provided term with selected fields.
        if (isset($providedFilters['term'])) {
            $multiMatchQueryFields = ['username', 'lastname', 'firstname'];
            if ($this->authorizationChecker->isGranted(UserRole::ROLE_ADMIN)) {
                $multiMatchQueryFields[] = 'email';
            }
            $boolQuery->addMust(
                (new Query\MultiMatch())
                    ->setQuery($providedFilters['term'])
                    ->setType('phrase_prefix')
                    ->setFields($multiMatchQueryFields)
            );
            $sort = [
                '_score' => [
                    'order' => 'desc',
                ],
                '_id' => new \stdClass(),
            ];
        }

        // User-specific filters (vip, userType) - these only apply to users
        if (isset($providedFilters['vip'])) {
            $vipCondition = (new BoolQuery())
                ->addShould(
                    (new BoolQuery())
                        ->addFilter(new Term(['objectType' => 'user']))
                        ->addFilter(new Term(['vip' => $providedFilters['vip']]))
                )
                ->addShould(new Term(['objectType' => 'participant']))
                ->setMinimumShouldMatch(1)
            ;
            $boolQuery->addFilter($vipCondition);
        }

        if (isset($providedFilters['userType'])) {
            $userTypeCondition = (new BoolQuery())
                ->addShould(
                    (new BoolQuery())
                        ->addFilter(new Term(['objectType' => 'user']))
                        ->addFilter(new Term(['userType.id' => $providedFilters['userType']]))
                )
                ->addShould(new Term(['objectType' => 'participant']))
                ->setMinimumShouldMatch(1)
            ;
            $boolQuery->addFilter($userTypeCondition);
        }

        // Common filters (emailConfirmed, consentInternalCommunication) - apply to both
        if (isset($providedFilters['emailConfirmed']) && $providedFilters['emailConfirmed']) {
            $boolQuery->addFilter(new Term(['isEmailConfirmed' => true]));
        }
        if (
            isset($providedFilters['consentInternalCommunication'])
            && $providedFilters['consentInternalCommunication']
        ) {
            $boolQuery->addFilter(new Term(['isConsentInternalCommunication' => true]));
        }

        $query = new Query($boolQuery);
        if (
            empty($sort)
            && !empty($orderBy)
            && $orderBy['direction']
            && UserOrderField::ACTIVITY === $orderBy['field']
        ) {
            $sort = [
                'participationsCountByProject.count' => [
                    'order' => strtolower((string) $orderBy['direction']),
                    'nested' => [
                        'path' => 'participationsCountByProject',
                        'filter' => [
                            'term' => [
                                'participationsCountByProject.project.id' => $project->getId(),
                            ],
                        ],
                    ],
                ],
                '_id' => new \stdClass(),
            ];
        }

        $query->setSort(
            empty($sort)
                ? [
                    !empty($orderBy) && $orderBy['field']
                        ? SortField::SORT_FIELD[$orderBy['field']]
                        : 'createdAt' => [
                            'order' => !empty($orderBy) && $orderBy['direction']
                                    ? OrderDirection::SORT_DIRECTION[$orderBy['direction']]
                                    : 'DESC',
                        ],
                    '_id' => new \stdClass(),
                ]
                : $sort
        );
        $this->applyCursor($query, $cursor);
        $query->setSource(['id', 'objectType'])->setSize($limit);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);
        $cursors = $this->getCursors($resultSet);

        return $this->hydrateContributorResults($cursors, $resultSet);
    }

    /**
     * @param array<mixed> $cursors
     */
    private function hydrateContributorResults(array $cursors, ResultSet $resultSet): ElasticsearchPaginatedResult
    {
        $repositories = [
            'user' => $this->userRepository,
            'participant' => $this->participantRepository,
        ];

        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromRepositories($repositories, $resultSet),
            $cursors,
            $resultSet->getTotalHits()
        );
    }
}
