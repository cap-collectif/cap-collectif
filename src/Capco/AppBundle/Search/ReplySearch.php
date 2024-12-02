<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Enum\ReplyOrderField;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Elastica\Aggregation\Cardinality;
use Elastica\Aggregation\Terms as AggregationTerms;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Term;
use Elastica\Result;
use Elastica\ResultSet;

class ReplySearch extends Search
{
    public function __construct(
        Index $index,
        private readonly ReplyRepository $replyRepository,
        private readonly ReplyAnonymousRepository $replyAnonymousRepository
    ) {
        parent::__construct($index);
        $this->type = 'reply';
    }

    public function getRepliesByStep(
        string $stepId,
        array $filters,
        int $limit,
        ?string $cursor
    ): ElasticsearchPaginatedResult {
        $boolQuery = (new BoolQuery())->addFilter(new Term(['step.id' => $stepId]));

        foreach ($filters as $key => $filter) {
            $boolQuery->addFilter(new Term([$key => $filter]));
        }

        $query = new Query($boolQuery);
        $query->setSort(['createdAt' => 'DESC', 'id' => new \stdClass()]);
        $this->addObjectTypeFilter($query, $this->type);
        $this->applyCursor($query, $cursor);
        $query->setSource(['id', 'objectType'])->setSize($limit);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);
        $cursors = $this->getCursors($resultSet);

        $replies = $this->getRepliesHydratedResults($resultSet);

        return new ElasticsearchPaginatedResult($replies, $cursors, $resultSet->getTotalHits());
    }

    public function getAdminRepliesByStep(
        string $stepId,
        array $filtersStatus,
        int $limit,
        ?string $cursor,
        ?string $term = null,
        ?array $orderBy = null
    ): ElasticsearchPaginatedResult {
        $boolQuery = (new BoolQuery())->addFilter(new Term(['step.id' => $stepId]));

        if ($filtersStatus) {
            $filterBoolQuery = new BoolQuery();
            foreach ($filtersStatus as $filter) {
                $filterBoolQuery->addShould(new Term(['replyStatus' => $filter]));
            }
            $boolQuery->addFilter($filterBoolQuery);
        }

        $query = new Query($boolQuery);
        $this->handleSort($query, $orderBy);
        $this->addObjectTypeFilter($query, $this->type);
        $this->applyCursor($query, $cursor);
        $query->setSource(['id', 'objectType'])->setSize($limit);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);
        $cursors = $this->getCursors($resultSet);

        $replies = $this->getRepliesHydratedResults($resultSet, $term);

        $totalCount = $term ? \count($replies) : $resultSet->getTotalHits();

        return new ElasticsearchPaginatedResult($replies, $cursors, $totalCount);
    }

    public function countQuestionnaireParticipants(string $stepId): int
    {
        $boolQuery = (new BoolQuery())
            ->addFilter(new Term(['step.id' => $stepId]))
            ->addFilter(new Term(['draft' => false]))
            ->addFilter(new Term(['published' => true]))
        ;

        $query = new Query($boolQuery);

        $this->addObjectTypeFilter($query, 'reply');

        $query
            ->setSource(['id'])
            ->setSize(0)
            ->setTrackTotalHits(true)
        ;

        $authenticatedParticipantsAggs = new Cardinality('authenticatedParticipants');
        $authenticatedParticipantsAggs->setField('author.id');
        $query->addAggregation($authenticatedParticipantsAggs);

        $allParticipantsAggs = new AggregationTerms('allParticipants');
        $allParticipantsAggs->setField('replyType');
        $query->addAggregation($allParticipantsAggs);

        $resultSet = $this->index->search($query);
        $authenticatedParticipants = $resultSet->getAggregation('authenticatedParticipants');
        $allParticipants = $resultSet->getAggregation('allParticipants');

        $anonymousParticipantsCount = 0;
        foreach ($allParticipants['buckets'] as $bucket) {
            if ('replyAnonymous' === $bucket['key']) {
                $anonymousParticipantsCount = $bucket['doc_count'];
            }
        }

        return $authenticatedParticipants['value'] + $anonymousParticipantsCount;
    }

    public function getRepliesHydratedResults(ResultSet $set, ?string $term = null): array
    {
        $informations = array_map(
            static fn (Result $result) => [
                'id' => $result->getDocument()->get('id'),
                'objectType' => $result->getDocument()->get('objectType'),
                'geoip' => $result->getDocument()->has('geoip')
                    ? $result->getDocument()->get('geoip')
                    : null,
            ],
            $set->getResults()
        );
        $ids = array_map(static fn (array $information) => $information['id'], $informations);

        $types = array_unique(
            array_map(static fn (array $information) => $information['objectType'], $informations)
        );
        $map = [];
        foreach ($types as $type) {
            $typeInformations = array_filter(
                $informations,
                static fn (array $information) => $information['objectType'] === $type
            );
            $typeIds = array_map(
                static fn (array $information) => $information['id'],
                $typeInformations
            );
            $map[$type] = $typeIds;
        }
        // We can't use findById because we would lost the correct order given by ES
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        $results = [];
        foreach ($map as $objectIds) {
            $replies = $term
                ? $this->replyRepository->hydrateFromIdsByTerm($objectIds, $term)
                : $this->replyRepository->hydrateFromIds($objectIds);
            $repliesAnon = $term ? [] : $this->replyAnonymousRepository->hydrateFromIds($objectIds);
            $results = array_merge($repliesAnon, $replies);
        }

        // We have to restore the correct order of ids, because Doctrine has lost it, see:
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        usort($results, static fn ($a, $b) => array_search($a->getId(), $ids, false) > array_search($b->getId(), $ids, false));

        $this->addGeoIpData($results, $informations);

        return $results;
    }

    private function handleSort(Query &$query, ?array $orderBy = null): void
    {
        if (!$orderBy) {
            $query->setSort(['createdAt' => 'DESC', 'id' => new \stdClass()]);

            return;
        }
        $field = ReplyOrderField::SORT_FIELD[$orderBy['field']];
        $query->setSort([$field => $orderBy['direction'], 'id' => new \stdClass()]);
    }
}
