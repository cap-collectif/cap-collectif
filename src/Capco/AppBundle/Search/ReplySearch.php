<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Repository\ReplyRepository;
use Elastica\Aggregation\Cardinality;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Term;

class ReplySearch extends Search
{
    private ReplyRepository $replyRepository;

    public function __construct(Index $index, ReplyRepository $replyRepository)
    {
        parent::__construct($index);
        $this->type = 'reply';
        $this->replyRepository = $replyRepository;
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
        $query->setSource(['id'])->setSize($limit);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);
        $cursors = $this->getCursors($resultSet);
        $replies = $this->getHydratedResultsFromResultSet($this->replyRepository, $resultSet);

        return new ElasticsearchPaginatedResult($replies, $cursors, $resultSet->getTotalHits());
    }

    public function countQuestionnaireParticipants(string $stepId): int
    {
        $boolQuery = (new BoolQuery())
            ->addFilter(new Term(['step.id' => $stepId]))
            ->addFilter(new Term(['draft' => false]))
            ->addFilter(new Term(['published' => true]));

        $query = new Query($boolQuery);
        $this->addObjectTypeFilter($query, $this->type);
        $query
            ->setSource(['id'])
            ->setSize(0)
            ->setTrackTotalHits(true);

        $agg = new Cardinality('participants');
        $agg->setField('author.id');
        $query->addAggregation($agg);
        $resultSet = $this->index->search($query);
        $aggregation = $resultSet->getAggregation('participants');

        return $aggregation['value'];
    }
}
