<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\ProposalOrderField;
use Capco\AppBundle\Enum\ProposalsState;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\Enum\ProposalTrashedStatus;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProposalRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Term;
use Elastica\Query\Terms;
use Elastica\ResultSet;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ProposalSearch extends Search
{
    // The int value represent the applied boost in the search queries.
    public const SEARCH_FIELDS = [
        'proposalTitle' => 9,
        'proposalTitle.std' => 9,
        'author.username.std' => 4,
        'author.username' => 4,
        'reference' => 1,
        'reference.std' => 1,
        'proposalBody' => 8,
        'proposalBody.std' => 8,
        'teaser' => 7,
        'teaser.std' => 7,
        'district.name' => 5,
        'district.name.std' => 5,
        'address.std' => 6,
        'address' => 6,
    ];

    public const NESTED_SEARCH_FIELDS = [
        'responses.textValue.std' => 3,
        'responses.textValue' => 3,
        'responses.objectValue.labels' => 2,
        'responses.objectValue.other' => 2,
    ];

    private ProposalRepository $proposalRepo;

    public function __construct(Index $index, ProposalRepository $proposalRepo)
    {
        parent::__construct($index);
        $this->proposalRepo = $proposalRepo;
        $this->type = 'proposal';
    }

    public function searchProposalsByProject(
        Project $project,
        string $order,
        array $providedFilters,
        int $limit,
        ?string $cursor
    ): ElasticsearchPaginatedResult {
        $boolQuery = new Query\BoolQuery();
        if ($providedFilters['term']) {
            $this->searchTermsInMultipleNestedFields($boolQuery, $providedFilters['term']);
        }
        $boolQuery->addFilter(new Term(['project.id' => ['value' => $project->getId()]]));
        $this->applyInaplicableFilters($boolQuery, $providedFilters);
        $stateTerms = [];
        $filters = $this->getFilters($providedFilters);
        foreach ($filters as $key => $value) {
            $term = new Term([$key => ['value' => $value]]);
            if (
                isset($providedFilters['state']) &&
                ProposalsState::ALL === $providedFilters['state'] &&
                \in_array($key, ['draft', 'published', 'trashed'], true)
            ) {
                $stateTerms[] = $term;
            } else {
                $boolQuery->addFilter($term);
            }
        }
        if (\count($stateTerms) > 0) {
            $subBoolQuery = new BoolQuery();
            foreach ($stateTerms as $stateTerm) {
                $subBoolQuery->addShould($stateTerm);
            }
            $boolQuery->addFilter($subBoolQuery);
        }

        $query = new Query($boolQuery);
        $this->applyCursor($query, $cursor);
        $query->setSource(['id'])->setSize($limit);

        $stepid = $providedFilters['step'];
        if ($providedFilters['step']) {
            $stepid = GlobalIdResolver::getDecodedId($providedFilters['step']);
            if ($stepid && isset($stepid['id'])) {
                $stepid = $stepid['id'];
            }
        }
        $query->setSort([['_score' => 'DESC'], ['id' => new \stdClass()]]);

        if ($order) {
            $query->setSort([
                !$providedFilters['term']
                    ? $this->getProposalSort($order, $stepid ?? null)
                    : ['_score' => ['order' => 'desc']],
                ['id' => new \stdClass()],
            ]);
        }

        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);
        $ids = [];
        $cursors = [];
        foreach ($resultSet as $result) {
            $ids[] = $result->getData()['id'];
            $cursors[] = $result->getParam('sort');
        }
        $proposals = $this->getHydratedResults($this->proposalRepo, $ids);

        return new ElasticsearchPaginatedResult($proposals, $cursors, $resultSet->getTotalHits());
    }

    // This method is called in ProposalFormProposalsDataLoader and is based only on the first collectstep of the project.
    public function searchProposals(
        int $limit,
        $terms,
        array $providedFilters,
        int $seed,
        ?string $cursor,
        ?string $order = null
    ): ElasticsearchPaginatedResult {
        $boolQuery = new Query\BoolQuery();
        if ($terms) {
            $this->searchTermsInMultipleNestedFields($boolQuery, $terms);
        }
        $this->applyInaplicableFilters($boolQuery, $providedFilters);
        $stateTerms = [];
        $filters = $this->getFilters($providedFilters);
        foreach ($filters as $key => $value) {
            if ('proposalAnalysts.analyst.id' === $key) {
                foreach ($value as $analyst) {
                    $boolQuery->addFilter(new Term([$key => ['value' => $analyst]]));
                }

                continue;
            }

            $term = new Term([$key => ['value' => $value]]);

            if (
                \in_array($key, ['draft', 'published', 'trashed'], true) &&
                (isset($providedFilters['state']) &&
                    ProposalsState::ALL === $providedFilters['state'])
            ) {
                $stateTerms[] = $term;
            } else {
                $boolQuery->addFilter($term);
            }
        }
        if (
            isset($providedFilters['restrictedViewerId']) &&
            $providedFilters['restrictedViewerId']
        ) {
            $terms = [
                new Term([
                    'proposalAnalysts.analyst.id' => [
                        'value' => $providedFilters['restrictedViewerId'],
                    ],
                ]),
                new Term(['author.id' => ['value' => $providedFilters['restrictedViewerId']]]),
                new Term(['supervisor.id' => ['value' => $providedFilters['restrictedViewerId']]]),
                new Term([
                    'decisionMaker.id' => ['value' => $providedFilters['restrictedViewerId']],
                ]),
            ];
            $subBoolQuery = new BoolQuery();
            foreach ($terms as $term) {
                $subBoolQuery->addShould($term);
            }
            $boolQuery->addMust($subBoolQuery);
        }
        if (\count($stateTerms) > 0) {
            $subBoolQuery = new BoolQuery();
            foreach ($stateTerms as $stateTerm) {
                $subBoolQuery->addShould($stateTerm);
            }
            $boolQuery->addFilter($subBoolQuery);
        }

        if ('random' === $order) {
            $query = $this->getRandomSortedQuery($boolQuery, $seed);
            $query->setSort(['_score' => new \stdClass(), 'id' => new \stdClass()]);
        } else {
            $query = new Query($boolQuery);
            $stepid = $providedFilters['collectStep'] ?? $providedFilters['selectionStep'];
            if ($stepid) {
                $stepid = GlobalIdResolver::getDecodedId($stepid);
                if ($stepid && isset($stepid['id'])) {
                    $stepid = $stepid['id'];
                }
            }

            if ($order) {
                $query->setSort([
                    $this->getProposalSort($order, $stepid),
                    ['id' => new \stdClass()],
                ]);
            }
        }

        $this->applyCursor($query, $cursor);
        $query->setSource(['id'])->setSize($limit);
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);

        $ids = [];
        $cursors = [];
        foreach ($resultSet as $result) {
            $ids[] = $result->getData()['id'];
            $cursors[] = $result->getParam('sort');
        }
        $proposals = $this->getHydratedResults($this->proposalRepo, $ids);

        return new ElasticsearchPaginatedResult($proposals, $cursors, $resultSet->getTotalHits());
    }

    public static function findOrderFromFieldAndDirection(string $field, string $direction): string
    {
        switch ($field) {
            case ProposalOrderField::VOTES:
                if (OrderDirection::ASC === $direction) {
                    $order = 'least-votes';
                } else {
                    $order = 'votes';
                }

                break;
            case ProposalOrderField::POINTS:
                if (OrderDirection::ASC === $direction) {
                    $order = 'least-points';
                } else {
                    $order = 'points';
                }

                break;
            case ProposalOrderField::REVISION_AT:
                if (OrderDirection::ASC === $direction) {
                    $order = 'old-revisions';
                } else {
                    $order = 'last-revisions';
                }

                break;
            case ProposalOrderField::PUBLISHED_AT:
                if (OrderDirection::ASC === $direction) {
                    $order = 'old-published';
                } else {
                    $order = 'last-published';
                }

                break;
            case ProposalOrderField::CREATED_AT:
                if (OrderDirection::ASC === $direction) {
                    $order = 'old';
                } else {
                    $order = 'last';
                }

                break;
            case ProposalOrderField::COMMENTS:
                $order = 'comments';

                break;
            case ProposalOrderField::COST:
                if (OrderDirection::ASC === $direction) {
                    $order = 'cheap';
                } else {
                    $order = 'expensive';
                }

                break;
            default:
                $order = 'random';

                break;
        }

        return $order;
    }

    public function searchProposalAssignedToViewer(
        string $projectId,
        string $viewerId,
        array $providedFilters,
        string $order,
        ?string $state = null,
        int $limit = 20,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $boolQuery = new Query\BoolQuery();
        if (isset($providedFilters['term'])) {
            $this->searchTermsInMultipleFields(
                $boolQuery,
                self::SEARCH_FIELDS,
                $providedFilters['term'],
                'phrase_prefix'
            );
        }
        if (!empty($providedFilters)) {
            $this->applyInaplicableFilters($boolQuery, $providedFilters);
            $filters = $this->getFilters($providedFilters);
            foreach ($filters as $key => $value) {
                if ('proposalAnalysts.analyst.id' === $key) {
                    $term = new Terms($key, $value);
                } else {
                    $term = new Term([$key => ['value' => $value]]);
                }
                $boolQuery->addFilter($term);
            }
        }

        $boolQuery->addFilter(new Term(['project.id' => ['value' => $projectId]]));

        $shouldQuery = new Query\BoolQuery();
        if (ProposalStatementState::TODO === $state) {
            $this->addAssignedViewerProposalsTodo($shouldQuery, $viewerId);
        } elseif (ProposalStatementState::DONE === $state) {
            $this->addAssignedViewerProposalsDone($shouldQuery, $viewerId);
        } else {
            $shouldQuery
                ->addShould(new Term(['proposalAnalysts.analyst.id' => ['value' => $viewerId]]))
                ->addShould(new Term(['supervisor.id' => ['value' => $viewerId]]))
                ->addShould(new Term(['decisionMaker.id' => ['value' => $viewerId]]));
        }

        $boolQuery->addFilter($shouldQuery);
        $query = new Query($boolQuery);

        if ($order) {
            $query->setSort([$this->getProposalSort($order, null), ['id' => new \stdClass()]]);
        }

        $this->applyCursor($query, $cursor);
        $query->setSource(['id'])->setSize($limit);
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);
        $cursors = $this->getCursors($resultSet);

        return $this->getData($cursors, $resultSet);
    }

    private function addAssignedViewerProposalsTodo(BoolQuery $boolQuery, string $viewerId): void
    {
        $boolQuery
            ->addShould(
                (new BoolQuery())
                    ->addShould(
                        (new BoolQuery())
                            ->addMustNot(
                                (new Query\Nested())->setPath('analyses')->setQuery(
                                    (new BoolQuery())->addFilter(
                                        new Term([
                                            'analyses.updatedBy.id' => ['value' => $viewerId],
                                        ])
                                    )
                                )
                            )
                            ->addFilter(
                                new Term(['proposalAnalysts.analyst.id' => ['value' => $viewerId]])
                            )
                    )
                    ->addShould(
                        (new Query\Nested())->setPath('analyses')->setQuery(
                            (new BoolQuery())
                                ->addFilter(
                                    new Term(['analyses.updatedBy.id' => ['value' => $viewerId]])
                                )
                                ->addFilter(
                                    new Term([
                                        'analyses.state' => [
                                            'value' => ProposalStatementState::IN_PROGRESS,
                                        ],
                                    ])
                                )
                        )
                    )
            )
            ->addShould(
                (new BoolQuery())
                    ->addFilter(new Term(['supervisor.id' => ['value' => $viewerId]]))
                    ->addFilter(
                        (new BoolQuery())
                            ->addShould(
                                (new BoolQuery())
                                    ->addFilter(
                                        new Term([
                                            'assessment.updatedBy.id' => ['value' => $viewerId],
                                        ])
                                    )
                                    ->addFilter(
                                        new Term([
                                            'assessment.state' => [
                                                'value' => ProposalStatementState::IN_PROGRESS,
                                            ],
                                        ])
                                    )
                            )
                            ->addShould(
                                (new BoolQuery())->addMustNot(new Query\Exists('assessment'))
                            )
                    )
            )
            ->addShould(
                (new BoolQuery())
                    ->addFilter(new Term(['decisionMaker.id' => ['value' => $viewerId]]))
                    ->addFilter(
                        (new BoolQuery())
                            ->addShould(
                                (new BoolQuery())
                                    ->addFilter(
                                        new Term([
                                            'decision.updatedBy.id' => ['value' => $viewerId],
                                        ])
                                    )
                                    ->addFilter(
                                        new Term([
                                            'decision.state' => [
                                                'value' => ProposalStatementState::IN_PROGRESS,
                                            ],
                                        ])
                                    )
                            )
                            ->addShould((new BoolQuery())->addMustNot(new Query\Exists('decision')))
                    )
            );
    }

    private function addAssignedViewerProposalsDone(BoolQuery $boolQuery, string $viewerId): void
    {
        $boolQuery
            ->addShould(
                (new Query\Nested())->setPath('analyses')->setQuery(
                    (new BoolQuery())
                        ->addFilter(new Term(['analyses.updatedBy.id' => ['value' => $viewerId]]))
                        ->addMustNot(
                            new Term([
                                'analyses.state' => [
                                    'value' => ProposalStatementState::IN_PROGRESS,
                                ],
                            ])
                        )
                )
            )
            ->addShould(
                (new BoolQuery())
                    ->addFilter(new Term(['supervisor.id' => ['value' => $viewerId]]))
                    ->addFilter(new Query\Exists('assessment'))
                    ->addFilter(
                        (new BoolQuery())->addMustNot(
                            new Term([
                                'assessment.state' => [
                                    'value' => ProposalStatementState::IN_PROGRESS,
                                ],
                            ])
                        )
                    )
            )

            ->addShould(
                (new BoolQuery())
                    ->addFilter(new Term(['decisionMaker.id' => ['value' => $viewerId]]))
                    ->addFilter(new Query\Exists('decision'))
                    ->addFilter(
                        new Term(['decision.state' => ['value' => ProposalStatementState::DONE]])
                    )
            );
    }

    private function getData(array $cursors, ResultSet $response): ElasticsearchPaginatedResult
    {
        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($this->proposalRepo, $response),
            $cursors,
            $response->getTotalHits()
        );
    }

    private function getProposalSort(string $order, ?string $stepId): array
    {
        switch ($order) {
            case 'old':
                $sortField = 'createdAt';
                $sortOrder = 'asc';

                break;
            case 'last':
                $sortField = 'createdAt';
                $sortOrder = 'desc';

                break;
            case 'old-published':
                $sortField = 'publishedAt';
                $sortOrder = 'asc';

                break;
            case 'last-published':
                $sortField = 'publishedAt';
                $sortOrder = 'desc';

                break;
            case 'votes':
                return [
                    'countByStep.votes' => [
                        'order' => 'desc',
                        'nested_path' => 'countByStep',
                        'nested_filter' => ['term' => ['countByStep.step.id' => $stepId]],
                    ],
                    'createdAt' => ['order' => 'desc'],
                ];
            case 'points':
                return [
                    'countByStep.points' => [
                        'order' => 'desc',
                        'nested_path' => 'countByStep',
                        'nested_filter' => ['term' => ['countByStep.step.id' => $stepId]],
                    ],
                    'createdAt' => ['order' => 'desc'],
                ];

            case 'least-votes':
                return [
                    'countByStep.votes' => [
                        'order' => 'asc',
                        'nested_path' => 'countByStep',
                        'nested_filter' => ['term' => ['countByStep.step.id' => $stepId]],
                    ],
                    'createdAt' => ['order' => 'desc'],
                ];
            case 'least-points':
                return [
                    'countByStep.points' => [
                        'order' => 'asc',
                        'nested_path' => 'countByStep',
                        'nested_filter' => ['term' => ['countByStep.step.id' => $stepId]],
                    ],
                    'createdAt' => ['order' => 'desc'],
                ];

            case 'comments':
                return [
                    'commentsCount' => ['order' => 'desc'],
                    'createdAt' => ['order' => 'desc'],
                ];

            case 'last-revisions':
                return [
                    'revisions.createdAt' => [
                        'order' => 'desc',
                        'nested_path' => 'revisions',
                    ],
                ];

            case 'old-revisions':
                return [
                    'revisions.createdAt' => [
                        'order' => 'asc',
                        'nested_path' => 'revisions',
                    ],
                ];

            case 'expensive':
                return [
                    'estimation' => ['order' => 'desc'],
                    'createdAt' => ['order' => 'desc'],
                ];
            case 'cheap':
                return [
                    'estimation' => ['order' => 'asc'],
                    'createdAt' => ['order' => 'desc'],
                ];
            default:
                throw new \RuntimeException('Unknown order: ' . $order);
        }

        return [$sortField => ['order' => $sortOrder]];
    }

    private function getFilters(array $providedFilters): array
    {
        $filters = [];
        $filters['draft'] = false;
        $filters['published'] = true;

        if (isset($providedFilters['trashedStatus'])) {
            if (ProposalTrashedStatus::TRASHED === $providedFilters['trashedStatus']) {
                $filters['trashed'] = true;
            } elseif (ProposalTrashedStatus::NOT_TRASHED === $providedFilters['trashedStatus']) {
                $filters['trashed'] = false;
            }
        }

        if (isset($providedFilters['step'])) {
            $globalId = GlobalId::fromGlobalId($providedFilters['step']);
            // A step wan either be a CollectStep or a SelectionStep.
            if ('CollectStep' === $globalId['type']) {
                $filters['step.id'] = $globalId['id'];
            } elseif ('SelectionStep' === $globalId['type']) {
                $filters['selections.step.id'] = $globalId['id'];
                if (isset($providedFilters['status'])) {
                    $filters['selections.status.id'] = $providedFilters['status'];
                }
            }
        }

        if (isset($providedFilters['selectionStep']) && !empty($providedFilters['selectionStep'])) {
            $filters['selections.step.id'] = $providedFilters['selectionStep'];
            if (isset($providedFilters['status'])) {
                $filters['selections.status.id'] = $providedFilters['status'];
            }
        }

        if (
            isset($providedFilters['status']) &&
            !isset($filters['selections.status.id']) &&
            Search::NONE_VALUE !== $providedFilters['status']
        ) {
            $filters['status.id'] = $providedFilters['status'];
        }

        if (isset($providedFilters['proposalForm'])) {
            $filters['proposalForm.id'] = $providedFilters['proposalForm'];
        }

        if (isset($providedFilters['district'])) {
            $filters['district.id'] = $providedFilters['district'];
        }

        if (isset($providedFilters['theme'])) {
            $filters['theme.id'] = $providedFilters['theme'];
        }

        if (isset($providedFilters['types']) && $providedFilters['types'] > 0) {
            $filters['author.userType.id'] = $providedFilters['types'];
        }
        if (
            isset($providedFilters['category']) &&
            Search::NONE_VALUE !== $providedFilters['category']
        ) {
            $filters['category.id'] = $providedFilters['category'];
        }
        if (isset($providedFilters['author'])) {
            $filters['author.id'] = $providedFilters['author'];
        }
        if (isset($providedFilters['published'])) {
            $filters['published'] = $providedFilters['published'];
        }
        if (isset($providedFilters['includeDraft']) && true === $providedFilters['includeDraft']) {
            unset($filters['draft'], $filters['published']);
        }
        if (isset($providedFilters['analysts'])) {
            $filters['proposalAnalysts.analyst.id'] = $providedFilters['analysts'];
        }
        if (isset($providedFilters['supervisor'])) {
            $filters['supervisor.id'] = $providedFilters['supervisor'];
        }
        if (isset($providedFilters['decisionMaker'])) {
            $filters['decisionMaker.id'] = $providedFilters['decisionMaker'];
        }
        if (isset($providedFilters['visible'])) {
            $filters['visible'] = $providedFilters['visible'];
        }

        if (isset($providedFilters['state'])) {
            switch ($providedFilters['state']) {
                case ProposalsState::ALL:
                    $filters['draft'] = true;
                    $filters['published'] = true;
                    $filters['trashed'] = true;

                    break;
                case ProposalsState::DRAFT:
                    $filters['draft'] = true;
                    $filters['published'] = false;
                    $filters['trashed'] = false;

                    break;
                case ProposalsState::TRASHED:
                    $filters['draft'] = false;
                    $filters['published'] = true;
                    $filters['trashed'] = true;

                    break;
                case ProposalsState::PUBLISHED:
                    $filters['draft'] = false;
                    $filters['published'] = true;
                    $filters['trashed'] = false;

                    break;
            }
        }

        if (isset($providedFilters['progressStatus'])) {
            $filters['progressStatus'] = $providedFilters['progressStatus'];
        }

        return $filters;
    }

    private function applyInaplicableFilters(BoolQuery $boolQuery, array &$filters): void
    {
        $inapplicableFilters = ['district', 'category', 'status', 'theme'];
        $existsFilters = [];
        foreach ($inapplicableFilters as $inapplicableFilter) {
            if (
                isset($filters[$inapplicableFilter]) &&
                Search::NONE_VALUE === $filters[$inapplicableFilter]
            ) {
                $existsFilters[] = new Query\Exists($inapplicableFilter);
                unset($filters[$inapplicableFilter]);
            }
        }
        if (!empty($existsFilters)) {
            foreach ($existsFilters as $existsFilter) {
                $boolQuery->addMustNot($existsFilter);
            }
        }
    }

    private function searchTermsInMultipleNestedFields(BoolQuery $boolQuery, string $terms): void
    {
        $nestedBoostedFields = $this->formatFieldsBoosts(self::NESTED_SEARCH_FIELDS);
        $boostedFields = $this->formatFieldsBoosts(self::SEARCH_FIELDS);
        $boolQuery->addMust(
            (new BoolQuery())
                ->addShould(
                    (new Query\MultiMatch())
                        ->setFields($boostedFields)
                        ->setQuery($terms)
                        ->setType('phrase_prefix')
                )
                ->addShould(
                    (new Query\Nested())->setPath('responses')->setQuery(
                        (new BoolQuery())->addMust(
                            (new Query\MultiMatch())
                                ->setFields($nestedBoostedFields)
                                ->setQuery($terms)
                                ->setType('phrase_prefix')
                        )
                    )
                )
        );
    }
}
