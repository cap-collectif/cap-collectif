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
use Elastica\ResultSet;

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
        ContributionType::VOTE => AbstractVote::class
    ];

    private $entityManager;

    public function __construct(Index $index, EntityManagerInterface $entityManager)
    {
        parent::__construct($index);
        $this->entityManager = $entityManager;
    }

    public function countByAuthorAndProject(User $user, string $projectId): int
    {
        $response = $this->index->search(
            $this->createCountByAuthorAndProjectQuery($user, $projectId)
        );

        return $response->getTotalHits();
    }

    public function countByAuthorAndStep(User $user, string $stepId): int
    {
        $response = $this->index->search($this->createCountByAuthorAndStepQuery($user, $stepId));

        return $response->getTotalHits();
    }

    public function countByAuthorAndConsultation(User $user, string $consultationId): int
    {
        $response = $this->index->search(
            $this->createCountByAuthorAndConsultationQuery($user, $consultationId)
        );

        return $response->getTotalHits();
    }

    public function countByAuthor(User $user): int
    {
        $response = $this->index->search($this->createCountByAuthorQuery($user));

        return $response->getTotalHits();
    }

    public function getContributionsByAuthor(User $user): ResultSet
    {
        $boolQuery = (new Query\BoolQuery())->addFilter(
            new Query\Term(['author.id' => ['value' => $user->getId()]])
        );
        $this->applyContributionsFilters($boolQuery);

        $query = new Query($boolQuery);
        $query->setSize(0);
        $query->addAggregation(
            (new Terms('projects'))
                ->setField('project.id')
                ->setSize(Search::BIG_INT_VALUE)
                ->addAggregation(
                    (new Terms('steps'))
                        ->setField('step.id')
                        ->setSize(Search::BIG_INT_VALUE)
                        ->addAggregation(
                            (new Terms('consultations'))
                                ->setField('consultation.id')
                                ->setSize(Search::BIG_INT_VALUE)
                        )
                )
        );

        return $this->index->search($query);
    }

    public function getContributionsByAuthorAndType(
        User $user,
        int $limit,
        string $type,
        ?string $cursor = null,
        bool $includeTrashed = false
    ): ElasticsearchPaginatedResult {
        $contributionClassName = self::CONTRIBUTION_TYPE_CLASS_MAPPING[$type];
        $boolQuery = new Query\BoolQuery();
        $boolQuery->addFilter(new Query\Term(['author.id' => $user->getId()]));

        $this->applyContributionsFilters(
            $boolQuery,
            [$contributionClassName::getElasticsearchTypeName()],
            false,
            $includeTrashed
        );

        $query = new Query($boolQuery);
        $query->addSort(['createdAt' => ['order' => 'DESC'], 'id' => new \stdClass()]);

        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $response = $this->index->search($query);
        $cursors = $this->getCursors($response);
        $repository = $this->entityManager->getRepository($contributionClassName);

        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($repository, $response),
            $cursors,
            $response->getTotalHits()
        );
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
        $contributions = ['results' => []];
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

        if (ContributionOrderField::RANDOM === strtoupper($order)) {
            $query = $this->getRandomSortedQuery($boolQuery, $seed);
            $query->setSort(['_score' => new \stdClass(), 'id' => new \stdClass()]);
        } else {
            $query = new Query($boolQuery);
            if ($order) {
                $query->setSort([$this->getSort($order), ['id' => new \stdClass()]]);
            }
        }
        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $response = $this->index->search($query);
        $cursors = $this->getCursors($response);

        if (0 === $limit && null === $cursor) {
            return new ElasticsearchPaginatedResult([], [], $response->getTotalHits());
        }

        foreach ($response->getResults() as $result) {
            $contributions['types'][$result->getType()][] = $result->getId();
            $contributions['ids'][] = $result->getId();
        }

        foreach ($contributions['types'] as $type => $contributionsData) {
            if (ContributionType::isValid(strtoupper($type))) {
                $contributions['results'] = array_merge(
                    $contributions['results'],
                    $this->entityManager
                        ->getRepository(self::CONTRIBUTION_TYPE_CLASS_MAPPING[strtoupper($type)])
                        ->findBy(['id' => $contributionsData])
                );
            }
        }
        unset($contributions['types']);

        $ids = $contributions['ids'];
        $results = $contributions['results'];
        usort($results, static function ($a, $b) use ($ids) {
            return array_search($a->getId(), $ids, false) > array_search($b->getId(), $ids, false);
        });

        return new ElasticsearchPaginatedResult($results, $cursors, $response->getTotalHits());
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

    private function createCountByAuthorQuery(User $user): Query
    {
        $boolQuery = (new Query\BoolQuery())->addFilter(
            new Query\Term(['author.id' => ['value' => $user->getId()]])
        );
        $this->applyContributionsFilters($boolQuery);

        $query = new Query($boolQuery);
        $this->addAggregationOnTypes($query);

        return $query;
    }

    private function createCountByAuthorAndProjectQuery(User $user, string $projectId): Query
    {
        $boolQuery = (new Query\BoolQuery())
            ->addFilter(new Query\Term(['project.id' => ['value' => $projectId]]))
            ->addFilter(new Query\Term(['author.id' => ['value' => $user->getId()]]));
        $this->applyContributionsFilters($boolQuery);

        $query = new Query($boolQuery);
        $this->addAggregationOnTypes($query);

        return $query;
    }

    private function createCountByAuthorAndStepQuery(User $user, string $stepId): Query
    {
        $boolQuery = (new Query\BoolQuery())
            ->addFilter(new Query\Term(['step.id' => ['value' => $stepId]]))
            ->addFilter(new Query\Term(['author.id' => ['value' => $user->getId()]]));
        $this->applyContributionsFilters($boolQuery);

        $query = new Query($boolQuery);
        $this->addAggregationOnTypes($query);

        return $query;
    }

    private function applyContributionsFilters(
        Query\BoolQuery $query,
        array $contributionTypes = null,
        bool $inConsultation = false,
        bool $includeTrashed = false
    ): void {
        $query
            ->addFilter(
                new Query\Terms(
                    '_type',
                    $contributionTypes ?: $this->getContributionElasticsearchTypes($inConsultation)
                )
            )
            ->addMustNot(
                array_merge(
                    [
                        new Query\Term(['published' => ['value' => false]]),
                        new Query\Exists('comment'),
                        new Query\Term(['draft' => ['value' => true]])
                    ],
                    !$includeTrashed ? [new Query\Exists('trashedAt')] : []
                )
            );
    }

    private function createCountByAuthorAndConsultationQuery(
        User $user,
        string $consultationId
    ): Query {
        $boolQuery = (new Query\BoolQuery())
            ->addFilter(new Query\Term(['published' => ['value' => true]]))
            ->addFilter(new Query\Term(['consultation.id' => ['value' => $consultationId]]))
            ->addFilter(new Query\Term(['author.id' => ['value' => $user->getId()]]))
            ->addFilter(new Query\Terms('_type', $this->getContributionElasticsearchTypes(true)))
            ->addMustNot([new Query\Exists('comment')]);

        $query = new Query($boolQuery);
        $this->addAggregationOnTypes($query);

        return $query;
    }

    /**
     * @param query $query
     *
     * Group each result by its type
     */
    private function addAggregationOnTypes(Query $query): void
    {
        $query->setSize(0);
        $agg = new Terms('types');
        $agg->setField('_type')->setSize(Search::BIG_INT_VALUE);
        $query->addAggregation($agg);
    }

    private function getContributionElasticsearchTypes(bool $inConsultation = false): array
    {
        $types = [
            Opinion::getElasticsearchTypeName(),
            OpinionVersion::getElasticsearchTypeName(),
            Argument::getElasticsearchTypeName(),
            Source::getElasticsearchTypeName(),
            Proposal::getElasticsearchTypeName(),
            Reply::getElasticsearchTypeName()
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
                    'createdAt' => ['order' => 'desc']
                ];
            case 'least-popular':
                return [
                    'votesCountNok' => ['order' => 'DESC'],
                    'votesCountOk' => ['order' => 'ASC'],
                    'createdAt' => ['order' => 'DESC']
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
                    'createdAt' => ['order' => 'DESC']
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
}
