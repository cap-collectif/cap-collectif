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

        return $this->index->getType($this->type)->count($query);
    }

    public function getResponsesByQuestion(
        AbstractQuestion $question,
        bool $withNotConfirmedUser = false,
        int $limit = 20,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $boolQuery = $this->getNoEmptyResultQueryBuilder($question, $withNotConfirmedUser);
        $boolQuery->addFilter(
            (new BoolQuery())->addShould([
                (new BoolQuery())->addFilter(new Exists('objectValue.labels')),
                (new BoolQuery())->addFilter(new Exists('objectValue.other')),
                (new BoolQuery())->addFilter(new Exists('textValue')),
            ])
        );

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
        $boolQuery = $this->getNoEmptyResultQueryBuilder($question, false);
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

    public function getQuestionChoiceResponses(
        QuestionChoice $questionChoice,
        bool $withNotConfirmedUser = false,
        int $limit = 20,
        ?string $cursor = null
    ): ElasticsearchPaginatedResult {
        $boolQuery = (new BoolQuery())->addFilter(
            (new BoolQuery())->addShould([
                (new BoolQuery())
                    ->addMustNot(new Term(['question.type' => ['value' => 'select']]))
                    ->addFilter(new Exists('objectValue.labels'))
                    ->addFilter(
                        new Query\Terms('objectValue.labels', [$questionChoice->getTitle()])
                    ),
                (new BoolQuery())->addFilter(
                    (new Query\Match())
                        ->setFieldQuery(
                            'textValue',
                            Sanitizer::escape($questionChoice->getTitle(), [' '])
                        )
                        ->setFieldOperator('textValue', Query\Match::OPERATOR_AND)
                ),
            ])
        );

        if ($question = $questionChoice->getQuestion()) {
            $boolQuery->addFilter(new Term(['question.id' => ['value' => $question->getId()]]));
        }

        if (!$withNotConfirmedUser) {
            $boolQuery->addFilter(new Term(['reply.published' => ['value' => true]]));
        }

        $boolQuery
            ->addFilter(new Exists('reply'))
            ->addMustNot(new Term(['reply.draft' => ['value' => true]]));

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

        if (
            $question instanceof MultipleChoiceQuestion ||
            ($question instanceof MultipleChoiceQuestion &&
                AbstractQuestion::QUESTION_TYPE_SELECT === $question->getType())
        ) {
            $boolQuery->addShould([
                (new BoolQuery())->addFilter(new Exists('objectValue')),
                (new BoolQuery())->addFilter(new Exists('textValue')),
            ]);
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
