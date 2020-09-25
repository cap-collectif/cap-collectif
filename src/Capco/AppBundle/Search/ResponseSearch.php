<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Elastica\Aggregation\Terms;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Exists;
use Elastica\Query\Term;

class ResponseSearch extends Search
{
    private AbstractResponseRepository $responseRepository;

    public function __construct(Index $index, AbstractResponseRepository $responseRepository)
    {
        parent::__construct($index);
        $this->type = 'response';
        $this->responseRepository = $responseRepository;
    }

    public function countParticipantsByQuestion(
        AbstractQuestion $question,
        bool $withNotConfirmedUser = false
    ): int {
        $boolQuery = $this->getNoEmptyResultQueryBuilder($question, $withNotConfirmedUser);

        $query = new Query($boolQuery);
        $query->addAggregation(
            (new Terms('distinct_participants'))
                ->setField('reply.author.id')
                ->setSize(Search::BIG_INT_VALUE)
        );

        $response = $this->index->getType($this->type)->search($query);

        return \count($response->getAggregation('distinct_participants')['buckets']);
    }

    public function getResponsesByQuestion(
        AbstractQuestion $question,
        bool $withNotConfirmedUser = false,
        int $limit = 20,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $boolQuery = $this->getNoEmptyResultQueryBuilder($question, $withNotConfirmedUser);

        $query = new Query($boolQuery);
        $this->setSortWithId($query, ['createdAt' => ['order' => 'desc']]);
        $this->applyCursor($query, $cursor);
        $query->setSource(['id'])->setSize($limit);
        $resultSet = $this->index->getType($this->type)->search($query);
        $cursors = $this->getCursors($resultSet);

        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($this->responseRepository, $resultSet),
            $cursors,
            $resultSet->getTotalHits()
        );
    }

    public function getOtherReponsesByQuestion(
        AbstractQuestion $question,
        int $limit = 20,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $boolQuery = $this->getNoEmptyResultQueryBuilder($question, true);
        $boolQuery
            ->addFilter(new Exists('objectValue'))
            ->addFilter(new Exists('objectValue.other'));

        $query = new Query($boolQuery);
        $this->setSortWithId($query, ['createdAt' => ['order' => 'desc']]);
        $this->applyCursor($query, $cursor);
        $query->setSource(['id'])->setSize($limit);
        $resultSet = $this->index->getType($this->type)->search($query);
        $cursors = $this->getCursors($resultSet);

        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($this->responseRepository, $resultSet),
            $cursors,
            $resultSet->getTotalHits()
        );
    }

    private function getNoEmptyResultQueryBuilder(
        AbstractQuestion $question,
        bool $withNotConfirmedUser
    ): BoolQuery {
        $boolQuery = new BoolQuery();

        $boolQuery
            ->addFilter(new Exists('reply'))
            ->addMustNot(new Term(['reply.draft' => ['value' => true]]))
            ->addFilter(new Term(['question.id' => ['value' => $question->getId()]]));

        if (!$withNotConfirmedUser) {
            $boolQuery->addFilter(new Term(['reply.published' => ['value' => true]]));
        }

        if ($question instanceof MultipleChoiceQuestion || $question instanceof SimpleQuestion) {
            $boolQuery->addShould([new Exists('textValue'), new Exists('objectValue')]);
        }

        if ($question instanceof MediaQuestion) {
            $boolQuery->addFilter(new Exists('medias'));
        }

        return $boolQuery;
    }
}
