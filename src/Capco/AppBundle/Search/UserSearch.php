<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\SortField;
use Capco\AppBundle\Enum\UserOrderField;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Repository\ProposalCollectSmsVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionSmsVoteRepository;
use Capco\AppBundle\Repository\ProposalStepPaperVoteCounterRepository;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use Capco\UserBundle\Entity\UserType;
use Capco\UserBundle\Repository\UserRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\Range;
use Elastica\Query\Term;
use Elastica\ResultSet;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UserSearch extends Search
{
    final public const SEARCH_FIELDS = ['username', 'username.std', 'email'];

    public function __construct(
        Index $index,
        private readonly UserRepository $userRepo,
        private readonly EventSearch $eventSearch,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly ReplyAnonymousRepository $replyAnonymousRepository,
        private readonly ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository,
        private readonly ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository,
        private readonly ProposalStepPaperVoteCounterRepository $paperVoteCounterRepository
    ) {
        parent::__construct($index);
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
            $boolQuery->addFilter(new Term(['userType.id' => ['value' => $type->getId()]]));
        }
        $boolQuery->addFilter(new Term(['enabled' => true]));

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
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);

        return [
            'results' => $this->getHydratedResultsFromResultSet($this->userRepo, $resultSet),
            'totalCount' => $resultSet->getTotalHits(),
        ];
    }

    public function getAllUsers(
        int $limit,
        array $orderBy,
        ?string $cursor = null,
        bool $showSuperAdmin = false,
        bool $includeDisabled = false,
        ?bool $emailConfirmed = null,
        ?bool $consentInternalCommunication = null,
        ?bool $onlyProjectAdmins = null
    ): ElasticsearchPaginatedResult {
        $boolQuery = new Query\BoolQuery();
        if (!$showSuperAdmin) {
            $queryString = new Query\QueryString();
            $queryString->setQuery('ROLE_SUPER_ADMIN');
            $queryString->setFields(['roles']);
            $boolQuery->addMustNot($queryString);
        }
        if (!$includeDisabled) {
            $boolQuery->addFilter(new Term(['enabled' => !$includeDisabled]));
        }
        if (null !== $emailConfirmed) {
            $boolQuery->addFilter(new Term(['isEmailConfirmed' => $emailConfirmed]));
        }
        if (null !== $consentInternalCommunication) {
            $boolQuery->addFilter(
                new Term(['isConsentInternalCommunication' => $consentInternalCommunication])
            );
        }

        if (null !== $onlyProjectAdmins) {
            $boolQuery->addFilter(new Term(['isOnlyProjectAdmin' => $onlyProjectAdmins]));
        }

        $query = new Query();
        $query->setQuery($boolQuery);
        $this->applyCursor($query, $cursor);
        $query->setSize($limit);

        $query->addSort($this->getUserSort($orderBy));
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $response = $this->index->search($query);
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
        bool $onlyUsers = false,
        bool $isMediatorCompliant = false
    ): array {
        $query = new Query\BoolQuery();
        $query->addFilter(new Term(['enabled' => true]));

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

        if ($isMediatorCompliant) {
            $query->addFilter(new Term(['isOnlyUser' => true]));
            $query->addMustNot(new Query\Exists('organizationId'));
            $query->addMustNot(new Term(['roles' => 'ROLE_MEDIATOR']));
        }

        $realQuery = Query::create($query);
        $this->addObjectTypeFilter($realQuery);
        $realQuery->setTrackTotalHits();
        $resultSet = $this->index->search($realQuery);
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
        $query->addFilter(new Term(['enabled' => true]));
        if ($terms) {
            $query = $this->searchTermsInMultipleFields($query, $fields, $terms, 'best_fields');
        }
        if (\count($notInIds) > 0) {
            $query = $this->searchNotInTermsForField($query, 'id', $notInIds);
        }

        $realQuery = Query::create($query);
        $this->addObjectTypeFilter($realQuery, $this->type);
        $realQuery->setTrackTotalHits(true);
        $resultSet = $this->index->search($query, 300);
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
        $boolQuery->addFilter(new Term(['enabled' => true]));

        if (isset($providedFilters['step'])) {
            $nestedQueryStep = new Query\Nested();
            $nestedQueryStep->setPath('participationsCountByStep');
            $nestedQueryStep->setQuery(
                (new Query\BoolQuery())
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
                    'id' => new \stdClass(),
                ];
            }
        } else {
            $nestedQueryProject = new Query\Nested();
            $nestedQueryProject->setPath('participationsCountByProject');
            $nestedQueryProject->setQuery(
                (new Query\BoolQuery())
                    ->addFilter(
                        new Query\Term([
                            'participationsCountByProject.project.id' => $project->getId(),
                        ])
                    )
                    ->addFilter(new Range('participationsCountByProject.count', ['gt' => 0]))
            );

            $boolQuery->addFilter($nestedQueryProject);
        }

        // add search query that match provided term with selected fields.
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
                'id' => new \stdClass(),
            ];
        }

        if (isset($providedFilters['vip'])) {
            $boolQuery->addFilter(new Term(['vip' => $providedFilters['vip']]));
        }
        if (isset($providedFilters['userType'])) {
            $boolQuery->addFilter(new Term(['userType.id' => $providedFilters['userType']]));
        }
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
                'id' => new \stdClass(),
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
                    'id' => new \stdClass(),
                ]
                : $sort
        );
        $this->applyCursor($query, $cursor);
        $query->setSource(['id'])->setSize($limit);
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);
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
                'nested' => [
                    'path' => 'participationsCountByStep',
                    'filter' => [
                        'term' => ['participationsCountByStep.step.id' => $step->getId()],
                    ],
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
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);
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
        $query->setSize($limit);
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);
        $cursors = $this->getCursors($resultSet);

        return $this->getData($cursors, $resultSet);
    }

    public function getAllContributors(int $offset, int $limit): array
    {
        $boolQuery = new Query\BoolQuery();
        $boolQuery->addFilter(new Range('totalParticipationsCount', ['gt' => 0]));
        $boolQuery->addFilter(new Term(['enabled' => true]));

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
            ->setSource(['id'])
        ;
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);

        $questionnaireAnonymousRepliesCount = $this->getAnonymousQuestionnaireRepliesCount();
        $proposalSmsAnonymousVotesCount = $this->getProposalSmsAnonymousVotesCount();
        $paperVotesCount = $this->getPaperVotesCount();

        $totalCount =
            $resultSet->getTotalHits() +
            $questionnaireAnonymousRepliesCount +
            $proposalSmsAnonymousVotesCount +
            $paperVotesCount
        ;

        return [
            'results' => $this->getHydratedResultsFromResultSet($this->userRepo, $resultSet),
            'totalCount' => $totalCount,
        ];
    }

    private function getAnonymousQuestionnaireRepliesCount(): int
    {
        return $this->replyAnonymousRepository->countAll();
    }

    private function getProposalSmsAnonymousVotesCount(): int
    {
        $selectionTotalCount = $this->proposalSelectionSmsVoteRepository->countAll();
        $collectTotalCount = $this->proposalCollectSmsVoteRepository->countAll();

        return $selectionTotalCount + $collectTotalCount;
    }

    private function getPaperVotesCount(): int
    {
        return $this->paperVoteCounterRepository->countAll();
    }

    private function getData(array $cursors, ResultSet $response): ElasticsearchPaginatedResult
    {
        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($this->userRepo, $response),
            $cursors,
            $response->getTotalHits()
        );
    }

    private function getUserSort(array $orderBy): array
    {
        $sortField = match ($orderBy['field']) {
            SortField::CREATED_AT => SortField::SORT_FIELD[SortField::CREATED_AT],
            default => throw new \RuntimeException("Unknown order: {$orderBy}"),
        };

        return [$sortField => ['order' => $orderBy['direction']], 'id' => new \stdClass()];
    }
}
