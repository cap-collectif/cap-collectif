<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Elasticsearch\Sanitizer;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\UserBundle\Entity\User;
use Elastica\Aggregation\AbstractTermsAggregation;
use Elastica\Aggregation\Cardinality;
use Elastica\Aggregation\Terms;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Exists;
use Elastica\Query\Term;
use Elastica\ResultSet;

class ResponseSearch extends Search
{
    public function __construct(Index $index, private readonly AbstractResponseRepository $responseRepository)
    {
        parent::__construct($index);
        $this->type = 'response';
    }

    public function countParticipantsByQuestion(
        AbstractQuestion $question,
        bool $withNotConfirmedUser = false
    ): int {
        $boolQuery = $this->getNoEmptyResultQueryBuilder($question, $withNotConfirmedUser);

        // we are applying the same filters as getResponsesByQuestion to avoid counting participant that does not reply to optionnal question
        $boolQuery->addFilter(
            (new BoolQuery())
                ->addShould((new BoolQuery())->addFilter(new Exists('objectValue.labels')))
                ->addShould((new BoolQuery())->addFilter(new Exists('objectValue.other')))
                ->addShould((new BoolQuery())->addFilter(new Exists('textValue')))
        );
        $query = new Query($boolQuery);
        $query
            ->setSource(['id'])
            ->setSize(0)
            ->setTrackTotalHits(true)
        ;
        $this->addObjectTypeFilter($query, $this->type);

        $authenticatedParticipantsAggs = new Cardinality('authenticatedParticipants');
        $authenticatedParticipantsAggs->setField('reply.author.id');
        $query->addAggregation($authenticatedParticipantsAggs);

        $allParticipantsAggs = new Terms('allParticipants');
        $allParticipantsAggs->setField('reply.replyType');
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

    public function getResponsesByQuestion(
        AbstractQuestion $question,
        bool $withNotConfirmedUser = false,
        ?string $term = null,
        ?string $sentimentFilter = null,
        ?string $category = null,
        ?User $starCrafter = null,
        array $orderBy = ['createdAt' => ['order' => 'desc']],
        int $limit = 20,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $boolQuery = $this->getNoEmptyResultQueryBuilder($question, $withNotConfirmedUser);
        $boolQuery->addFilter(
            (new BoolQuery())
                ->addShould((new BoolQuery())->addFilter(new Exists('objectValue.other')))
                ->addShould((new BoolQuery())->addFilter(new Exists('objectValue.labels')))
                ->addShould((new BoolQuery())->addFilter(new Exists('textValue')))
        );

        if ($term) {
            $boolQuery->addFilter(
                (new Query\MatchQuery())
                    ->setFieldQuery('textValue', Sanitizer::escape($term, [' ']))
                    ->setFieldOperator('textValue', Query\MatchQuery::OPERATOR_AND)
            );
        }

        if ($sentimentFilter) {
            $boolQuery->addFilter(new Term(['iaSentiment' => strtolower($sentimentFilter)]));
        }

        if ($category) {
            $boolQuery->addFilter(
                (new Query\MatchQuery())
                    ->setFieldQuery('iaCategory', Sanitizer::escape($category, [' ']))
                    ->setFieldOperator('iaCategory', Query\MatchQuery::OPERATOR_AND)
            );
        }

        if ($starCrafter) {
            $boolQuery->addFilter(new Term(['starCrafters.id' => ['value' => $starCrafter->getId()]]));
        }

        $boolQuery->addFilter(new Term(['reply.completionStatus' => 'COMPLETED']));

        $query = new Query($boolQuery);
        $this->setSortWithId($query, $orderBy);
        $this->applyCursor($query, $cursor);
        $query->setSource(['id'])->setSize($limit);
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);
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
        $boolQuery = $this->getNoEmptyResultQueryBuilder($question, false);
        $boolQuery
            ->addFilter(new Exists('objectValue'))
            ->addFilter(new Exists('objectValue.other'))
        ;

        $query = new Query($boolQuery);
        $this->setSortWithId($query, ['createdAt' => ['order' => 'desc']]);
        $this->applyCursor($query, $cursor);
        $query->setSource(['id'])->setSize($limit);
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);
        $cursors = $this->getCursors($resultSet);

        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($this->responseRepository, $resultSet),
            $cursors,
            $resultSet->getTotalHits()
        );
    }

    public function getQuestionChoiceResponses(
        QuestionChoice $questionChoice,
        bool $withNotConfirmedUser = false,
        int $limit = 20,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $boolQuery = (new BoolQuery())->addFilter(
            (new BoolQuery())
                ->addShould(
                    (new BoolQuery())
                        ->addMustNot(new Term(['question.type' => ['value' => 'select']]))
                        ->addFilter(new Exists('objectValue.labels'))
                        ->addFilter(
                            new Query\Terms('objectValue.labels', [$questionChoice->getTitle()])
                        )
                )
                ->addShould(
                    (new BoolQuery())->addFilter(
                        new Query\Term(['textValue.key' => $questionChoice->getTitle()])
                    )
                )
        );

        if ($question = $questionChoice->getQuestion()) {
            $boolQuery->addFilter(new Term(['question.id' => ['value' => $question->getId()]]));
        }

        if (!$withNotConfirmedUser) {
            $boolQuery->addFilter(new Term(['reply.published' => ['value' => true]]));
        }

        $boolQuery
            ->addFilter(new Exists('reply'))
            ->addMustNot(new Term(['reply.draft' => ['value' => true]]))
        ;

        $query = new Query($boolQuery);

        $this->setSortWithId($query, ['createdAt' => ['order' => 'desc']]);
        $this->applyCursor($query, $cursor);
        $query->setSource(['id'])->setSize($limit);
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);
        $resultSet = $this->index->search($query);
        $cursors = $this->getCursors($resultSet);

        return new ElasticsearchPaginatedResult(
            $this->getHydratedResultsFromResultSet($this->responseRepository, $resultSet),
            $cursors,
            $resultSet->getTotalHits()
        );
    }

    public function getTagCloud(AbstractQuestion $question, int $size): ResultSet
    {
        $boolQuery = $this->getNoEmptyResultQueryBuilder($question, false);
        $query = new Query($boolQuery);
        $query->setSize(0);
        $agg = new Terms('tagCloud');
        $agg->setOrder('_count', 'desc');
        $agg->setField('textValue.tag')->setSize($size);
        $agg = $this->setTagCloudBucketMinOccurrences($agg, $question);
        $query->addAggregation($agg);
        $this->addObjectTypeFilter($query, $this->type);
        $query->setTrackTotalHits(true);

        return $this->index->search($query);
    }

    private function setTagCloudBucketMinOccurrences(
        AbstractTermsAggregation $agg,
        AbstractQuestion $question
    ): AbstractTermsAggregation {
        $responsesCount = $question->getResponses()->count();
        // We set a different minimumOccurrences value that depends on the responses count of the question.
        $minimumDocumentCount = match (true) {
            $responsesCount <= 10 => 2,
            $responsesCount <= 20 => 3,
            $responsesCount <= 25 => 4,
            default => 5,
        };

        $agg->setMinimumDocumentCount($minimumDocumentCount);

        return $agg;
    }

    private function getNoEmptyResultQueryBuilder(
        AbstractQuestion $question,
        bool $withNotConfirmedUser
    ): BoolQuery {
        $boolQuery = new BoolQuery();

        $boolQuery
            ->addFilter(new Exists('reply'))
            ->addMustNot(new Term(['reply.draft' => ['value' => true]]))
            ->addFilter(new Term(['question.id' => ['value' => $question->getId()]]))
            ->addFilter(new Term(['reply.completionStatus' => 'COMPLETED']))
        ;

        if (!$withNotConfirmedUser) {
            $boolQuery->addFilter(new Term(['reply.published' => ['value' => true]]));
        }

        if (
            $question instanceof MultipleChoiceQuestion
            || ($question instanceof MultipleChoiceQuestion
                && AbstractQuestion::QUESTION_TYPE_SELECT === $question->getType())
        ) {
            $boolQuery
                ->addShould((new BoolQuery())->addFilter(new Exists('objectValue')))
                ->addShould((new BoolQuery())->addFilter(new Exists('textValue')))
            ;
        }

        if ($question instanceof SimpleQuestion) {
            $boolQuery->addFilter(new Exists('textValue'));
        }

        if ($question instanceof MediaQuestion) {
            $boolQuery->addFilter(new Exists('medias'));
        }

        return $boolQuery;
    }
}
