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
use Capco\AppBundle\Enum\ContributionType;
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
        $boolQuery
            ->addFilter(new Query\Term(['author.id' => $user->getId()]))
            ->addFilter(
                new Query\Terms('_type', [$contributionClassName::getElasticsearchTypeName()])
            );

        $boolQuery->addMustNot(
            array_merge(
                [
                    new Query\Term(['published' => ['value' => false]]),
                    new Query\Term(['draft' => ['value' => true]])
                ],
                !$includeTrashed ? [new Query\Exists('trashedAt')] : []
            )
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
        int $limit,
        ?string $cursor = null,
        bool $includeTrashed = false
    ): ElasticsearchPaginatedResult {
        $contributions = [
            'results' => []
        ];
        $boolQuery = new Query\BoolQuery();
        $boolQuery
            ->addFilter(new Query\Term(['consultation.id' => $consultationId]))
            ->addFilter(new Query\Exists('consultation'));

        $boolQuery->addMustNot(
            array_merge(
                [
                    new Query\Term(['published' => ['value' => false]]),
                    new Query\Term(['draft' => ['value' => true]])
                ],
                !$includeTrashed ? [new Query\Exists('trashedAt')] : []
            )
        );
        $this->applyContributionsFilters($boolQuery, null, true);

        $query = new Query($boolQuery);
        $query->addSort(['createdAt' => ['order' => 'DESC'], 'id' => new \stdClass()]);
        $this->applyCursor($query, $cursor);
        $query->setSize($limit);
        $response = $this->index->search($query);
        $cursors = $this->getCursors($response);

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
        bool $inConsultation = false
    ): void {
        $query
            ->addFilter(
                new Query\Terms(
                    '_type',
                    $contributionTypes ?: $this->getContributionElasticsearchTypes($inConsultation)
                )
            )
            ->addMustNot([
                new Query\Term(['published' => ['value' => false]]),
                new Query\Exists('comment'),
                new Query\Term(['draft' => ['value' => true]]),
                new Query\Exists('trashedAt')
            ]);
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

    private function getContributionElasticsearchTypes($inConsultation = false): array
    {
        $types = [
            Opinion::getElasticsearchTypeName(),
            OpinionVersion::getElasticsearchTypeName(),
            Argument::getElasticsearchTypeName(),
            Source::getElasticsearchTypeName(),
            Proposal::getElasticsearchTypeName(),
            AbstractVote::getElasticsearchTypeName(),
            Reply::getElasticsearchTypeName()
        ];

        if ($inConsultation) {
            unset($types[AbstractVote::getElasticsearchTypeName()]);
        }

        return $types;
    }
}
