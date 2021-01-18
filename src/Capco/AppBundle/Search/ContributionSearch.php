<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Enum\ContributionOrderField;
use Capco\AppBundle\Enum\ContributionType;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Elastica\Aggregation\Terms;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Term;
use Elastica\ResultSet;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ContributionSearch extends Search
{
    public const CONTRIBUTION_TYPE_CLASS_MAPPING = [
        ContributionType::COMMENT => Comment::class,
        ContributionType::OPINION => Opinion::class,
        ContributionType::OPINIONVERSION => OpinionVersion::class,
        ContributionType::ARGUMENT => Argument::class,
        ContributionType::SOURCE => Source::class,
        ContributionType::REPLY => Reply::class,
        ContributionType::PROPOSAL => Proposal::class,
    ];

    private $entityManager;

    public function __construct(Index $index, EntityManagerInterface $entityManager)
    {
        parent::__construct($index);
        $this->entityManager = $entityManager;
    }

    public function getSubmissionsByAuthor(User $user, string $resultType): ResultSet
    {
        $boolQuery = (new Query\BoolQuery())->addFilter(
            new Query\Term(['author.id' => ['value' => $user->getId()]])
        );

        $this->applyContributionsFilters(
            $boolQuery,
            $this->getTypesFilterByResultType($resultType),
            false,
            true
        );

        $query = new Query($boolQuery);
        $query->setSize(0);
        $query->addAggregation(
            (new Terms($resultType . 'ByProject'))
                ->setField('project.id')
                ->setSize(Search::BIG_INT_VALUE)
                ->addAggregation(
                    $stepAggregation = (new Terms($resultType . 'ByStep'))
                        ->setField('step.id')
                        ->setSize(Search::BIG_INT_VALUE)
                )
        );

        if ('participations' === $resultType) {
            $stepAggregation->addAggregation(
                (new Terms($resultType . 'ByConsultation'))
                    ->setField('consultation.id')
                    ->setSize(Search::BIG_INT_VALUE)
            );
        }
        $query->setTrackTotalHits(true);

        return $this->index->search($query);
    }

    public function getSortField(?string $field): string
    {
        if (null === $field) {
            return 'createdAt';
        }
        switch ($field) {
            case 'CREATED_AT':
                return 'createdAt';
            case 'PUBLISHED_AT':
                return 'publishedAt';
            default:
                return 'createdAt';
        }
    }

    public function getArgumentsByUserIds(?User $viewer, array $keys): array
    {
        $client = $this->index->getClient();
        $globalQuery = new \Elastica\Multi\Search($client);

        foreach ($keys as $key) {
            $boolQuery = new BoolQuery();
            $boolQuery->addFilter(
                new Query\Term(['author.id' => ['value' => $key['user']->getId()]])
            );

            list(
                $cursor,
                $field,
                $direction,
                $limit,
                $includeUnpublished,
                $includeTrashed,
                $aclDisabled,
            ) = [
                $key['args']->offsetGet('after'),
                $key['args']->offsetGet('orderBy')['field'] ?? 'createdAt',
                $key['args']->offsetGet('orderBy')['direction'] ?? 'DESC',
                $key['args']->offsetGet('first'),
                $key['args']->offsetGet('includeUnpublished') ?? false,
                $key['args']->offsetGet('includeTrashed') ?? false,
                $key['args']->offsetGet('aclDisabled') ?? false,
            ];

            if (!$aclDisabled) {
                $this->getFiltersForProjectViewerCanSee('project', $viewer);
            }

            $contributionTypes = [Argument::getElasticsearchTypeName()];
            $this->applyContributionsFilters($boolQuery, $contributionTypes, true, $includeTrashed);

            if (!$includeUnpublished) {
                $boolQuery->addFilter(new Term(['published' => ['value' => true]]));
            }

            $query = new Query($boolQuery);
            $query->setTrackTotalHits(true);

            $order = [
                $this->getSortField($field) => ['order' => $direction],
            ];
            $this->setSortWithId($query, $order);

            if ($limit) {
                // + 1 for paginator data
                $query->setSize($limit + 1);
            }

            $this->applyCursor($query, $cursor);
            $searchQuery = $this->index->createSearch($query);
            $globalQuery->addSearch($searchQuery);
        }

        $responses = $globalQuery->search();
        $results = [];
        $resultSets = $responses->getResultSets();
        foreach ($resultSets as $key => $resultSet) {
            $results[] = new ElasticsearchPaginatedResult(
                $this->getHydratedResultsFromResultSet(
                    $this->entityManager->getRepository(Argument::class),
                    $resultSet
                ),
                $this->getCursors($resultSet),
                $resultSet->getTotalHits()
            );
        }

        return $results;
    }

    public function getUserContributions(
        User $user,
        int $limit,
        string $order,
        string $seed,
        ?string $contribuableId,
        ?string $type,
        ?string $cursor,
        array $filters = [],
        bool $includeTrashed = false
    ): ElasticsearchPaginatedResult {
        $contributions = ['results' => []];
        $inConsultation = true;
        $contributionTypes = null;
        $boolQuery = new Query\BoolQuery();
        list($contribuableDecodedId, $contribuableType) = [
            GlobalId::fromGlobalId($contribuableId)['id'],
            GlobalId::fromGlobalId($contribuableId)['type'],
        ];
        $boolQuery->addFilter(new Query\Term(['author.id' => ['value' => $user->getId()]]));

        if ($contribuableType) {
            switch ($contribuableType) {
                case 'Consultation':
                    $boolQuery
                        ->addFilter(
                            new Query\Term([
                                'consultation.id' => ['value' => $contribuableDecodedId],
                            ])
                        )
                        ->addFilter(new Query\Exists('consultation'));
                    $inConsultation = true;

                    break;
                case 'Project':
                    $boolQuery
                        ->addFilter(
                            new Query\Term(['project.id' => ['value' => $contribuableDecodedId]])
                        )
                        ->addFilter(new Query\Exists('project'));

                    break;
                case false !== strpos($contribuableType, 'Step'):
                    $boolQuery
                        ->addFilter(
                            new Query\Term(['step.id' => ['value' => $contribuableDecodedId]])
                        )
                        ->addFilter(new Query\Exists('step'));

                    break;
                default:
                    throw new UserError(
                        'The contribuableId "' .
                            $contribuableId .
                            '" does not match any Project, Step or Consultation'
                    );
            }
        }

        if (!empty($filters)) {
            foreach ($filters as $filter) {
                $boolQuery->addFilter(new Query\Term($filter));
            }
        }

        if (
            $type &&
            ($contributionClassName = self::CONTRIBUTION_TYPE_CLASS_MAPPING[strtoupper($type)])
        ) {
            $contributionTypes = [$contributionClassName::getElasticsearchTypeName()];
        }

        $this->applyContributionsFilters(
            $boolQuery,
            $contributionTypes,
            $inConsultation,
            $includeTrashed
        );
        $query = $this->createSortedQuery($order, $boolQuery, $seed);
        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $query->setTrackTotalHits(true);
        $response = $this->index->search($query);
        if (0 === $limit && null === $cursor) {
            return new ElasticsearchPaginatedResult([], [], $response->getTotalHits());
        }

        return $this->getQueryOrderedResults($response);
    }

    public function getContributionsByConsultation(
        string $consultationId,
        string $order,
        array $filters,
        string $seed,
        int $limit,
        ?string $cursor = null,
        bool $includeTrashed = false
    ): ElasticsearchPaginatedResult {
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(new Query\Term(['consultation.id' => $consultationId]))
            ->addFilter(new Query\Exists('consultation'));

        if (!empty($filters)) {
            foreach ($filters as $filter) {
                $boolQuery->addFilter(new Query\Term($filter));
            }
        }

        $this->applyContributionsFilters($boolQuery, null, true, $includeTrashed);
        $query = $this->createSortedQuery($order, $boolQuery, $seed);
        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $query->setTrackTotalHits(true);
        $response = $this->index->search($query);
        if (0 === $limit && null === $cursor) {
            return new ElasticsearchPaginatedResult([], [], $response->getTotalHits());
        }

        return $this->getQueryOrderedResults($response);
    }

    public function getContributionsByProject(
        string $projectId,
        string $order,
        array $filters,
        int $limit,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $boolQuery = new Query\BoolQuery();
        $boolQuery->addFilter(new Query\Term(['project.id' => $projectId]));
        $this->applyContributionsFilters($boolQuery, $filters['_type'], true, true);
        unset($filters['_type']);

        if (!empty($filters)) {
            foreach ($filters as $key => $filter) {
                $boolQuery->addFilter(new Query\Term([$key => ['value' => $filter]]));
            }
        }
        $boolQuery->addFilter(
            (new BoolQuery())->addShould([
                (new BoolQuery())
                    ->addFilter(new Query\Exists('opinion'))
                    ->addFilter(new Term(['opinion.published' => ['value' => true]])),
                (new BoolQuery())
                    ->addFilter(new Query\Exists('opinionVersion'))
                    ->addFilter(new Term(['opinionVersion.published' => ['value' => true]])),
                new Query\MatchAll(),
            ])
        );

        $query = new Query($boolQuery);
        if ($order) {
            $query->setSort([$this->getSort($order), ['id' => new \stdClass()]]);
        }
        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $query->setTrackTotalHits(true);
        $response = $this->index->search($query);

        if (0 === $limit && null === $cursor) {
            return new ElasticsearchPaginatedResult([], [], $response->getTotalHits());
        }

        return $this->getQueryOrderedResults($response);
    }

    public static function findOrderFromFieldAndDirection(string $field, string $direction): string
    {
        $order = ContributionOrderField::RANDOM;
        switch ($field) {
            case ContributionOrderField::CREATED_AT:
                $order = 'last';
                if (OrderDirection::ASC === $direction) {
                    $order = 'old';
                }

                break;
            case ContributionOrderField::PUBLISHED_AT:
                $order = 'last-published';
                if (OrderDirection::ASC === $direction) {
                    $order = 'old-published';
                }

                break;
            case ContributionOrderField::COMMENT_COUNT:
                $order = 'comments';

                break;
            case ContributionOrderField::VOTE_COUNT:
                $order = 'voted';
                if (OrderDirection::ASC === $direction) {
                    $order = 'least-voted';
                }

                break;
            case ContributionOrderField::POPULAR:
                $order = 'popular';
                if (OrderDirection::ASC === $direction) {
                    $order = 'least-popular';
                }

                break;
            case ContributionOrderField::POSITION:
                $order = 'position';
                if (OrderDirection::ASC === $direction) {
                    $order = 'least-position';
                }

                break;
        }

        return $order;
    }

    private function getQueryOrderedResults(ResultSet $response): ElasticsearchPaginatedResult
    {
        // Re-order results back in the order given by doctrine
        $contributions = ['results' => []];
        $cursors = $this->getCursors($response);
        foreach ($response->getResults() as $result) {
            $document = $result->getDocument();
            $contributions['types'][$document->get('objectType')][] = $document->get('id');
            $contributions['ids'][] = $document->get('id');
        }
        $count = $response->getResponse()->getData()['hits']['total']['value'];

        if (!empty($contributions['types'])) {
            foreach ($contributions['types'] as $type => $contributionsData) {
                if (ContributionType::isValid(strtoupper($type))) {
                    $contributions['results'] = array_merge(
                        $contributions['results'],
                        $this->entityManager
                            ->getRepository(
                                self::CONTRIBUTION_TYPE_CLASS_MAPPING[strtoupper($type)]
                            )
                            ->findBy(['id' => $contributionsData])
                    );
                }
            }
            unset($contributions['types']);
        } else {
            return new ElasticsearchPaginatedResult([], [], $count);
        }

        $ids = $contributions['ids'];
        $results = $contributions['results'];
        usort($results, static function ($a, $b) use ($ids) {
            return array_search($a->getId(), $ids, false) > array_search($b->getId(), $ids, false);
        });

        return new ElasticsearchPaginatedResult($results, $cursors, $count);
    }

    private function applyContributionsFilters(
        Query\BoolQuery $query,
        ?array $contributionTypes = null,
        bool $inConsultation = false,
        bool $includeTrashed = false
    ): void {
        $query
            ->addFilter(
                new Query\Terms(
                    'objectType',
                    $contributionTypes ?: $this->getContributionElasticsearchTypes($inConsultation)
                )
            )
            ->addMustNot(
                array_merge(
                    [
                        new Query\Term(['published' => ['value' => false]]),
                        new Query\Exists('comment'),
                        new Query\Term(['draft' => ['value' => true]]),
                    ],
                    !$includeTrashed ? [new Query\Exists('trashedAt')] : []
                )
            );
    }

    private function getContributionElasticsearchTypes(bool $inConsultation = false): array
    {
        $types = [
            Opinion::getElasticsearchTypeName(),
            OpinionVersion::getElasticsearchTypeName(),
            Argument::getElasticsearchTypeName(),
            Source::getElasticsearchTypeName(),
            Proposal::getElasticsearchTypeName(),
            Reply::getElasticsearchTypeName(),
        ];

        if (!$inConsultation) {
            $types[] = AbstractVote::getElasticsearchTypeName();
        }

        return $types;
    }

    private function getSort(string $order): array
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
            case 'comments':
                return [
                    'commentsCount' => ['order' => 'desc'],
                    'createdAt' => ['order' => 'desc'],
                ];
            case 'least-popular':
                return [
                    'votesCountNok' => ['order' => 'DESC'],
                    'votesCountOk' => ['order' => 'ASC'],
                    'createdAt' => ['order' => 'DESC'],
                ];
            case 'least-voted':
                $sortField = 'votesCount';
                $sortOrder = 'asc';

                break;
            case 'position':
                $sortField = 'position';
                $sortOrder = 'desc';

                break;
            case 'least-position':
                $sortField = 'position';
                $sortOrder = 'asc';

                break;
            case 'popular':
                return [
                    'votesCountOk' => ['order' => 'DESC'],
                    'votesCountNok' => ['order' => 'ASC'],
                    'createdAt' => ['order' => 'DESC'],
                ];
            case 'voted':
                $sortField = 'votesCount';
                $sortOrder = 'desc';

                break;
            default:
                throw new \RuntimeException('Unknown order: ' . $order);

                break;
        }

        return [$sortField => ['order' => $sortOrder]];
    }

    private function createSortedQuery(
        string $order,
        Query\BoolQuery $boolQuery,
        string $seed
    ): Query {
        if (ContributionOrderField::RANDOM === strtoupper($order)) {
            $query = $this->getRandomSortedQuery($boolQuery, $seed);
            $query->setSort(['_score' => new \stdClass(), 'id' => new \stdClass()]);
        } else {
            $query = new Query($boolQuery);
            if ($order) {
                $query->setSort([$this->getSort($order), ['id' => new \stdClass()]]);
            }
        }

        return $query;
    }

    private function getTypesFilterByResultType(string $resultType): array
    {
        if ('participations' === $resultType) {
            return [
                Opinion::getElasticsearchTypeName(),
                OpinionVersion::getElasticsearchTypeName(),
                Argument::getElasticsearchTypeName(),
                Source::getElasticsearchTypeName(),
                Proposal::getElasticsearchTypeName(),
                Reply::getElasticsearchTypeName(),
                AbstractVote::getElasticsearchTypeName(),
            ];
        }

        if ('contributions' === $resultType) {
            return [
                Opinion::getElasticsearchTypeName(),
                OpinionVersion::getElasticsearchTypeName(),
                Argument::getElasticsearchTypeName(),
                Source::getElasticsearchTypeName(),
                Proposal::getElasticsearchTypeName(),
                Reply::getElasticsearchTypeName(),
            ];
        }

        if ('votes' === $resultType) {
            return [AbstractVote::getElasticsearchTypeName()];
        }

        throw new \RuntimeException('The provided result type did not match any conditions.');
    }
}
