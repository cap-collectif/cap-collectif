<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Elasticsearch\Sanitizer;
use Capco\AppBundle\Repository\QuestionChoiceRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\BoolQuery;
use Elastica\Query\Term;

class QuestionChoiceSearch extends Search
{
    private const FUZZINNESS_LEVEL = 2;
    private $choiceRepository;

    public function __construct(Index $index, QuestionChoiceRepository $choiceRepository)
    {
        parent::__construct($index);
        $this->type = 'questionChoice';
        $this->choiceRepository = $choiceRepository;
    }

    public function searchQuestionChoices(array $questionDatas): array
    {
        $client = $this->index->getClient();
        $multiSearchQuery = new \Elastica\Multi\Search($client);

        foreach ($questionDatas as $questionData) {
            $searchQuery = $this->index->createSearch();
            $boolQuery = new BoolQuery();

            list($term, $cursor, $limit, $random, $isRandomQuestionChoices, $seed) = [
                $questionData['args']->offsetGet('term'),
                $questionData['args']->offsetGet('after'),
                $questionData['args']->offsetGet('first'),
                $questionData['args']->offsetGet('allowRandomize'),
                $questionData['isRandomQuestionChoices'],
                $questionData['seed'] ?: null,
            ];
            $boolQuery->addFilter(new Term(['question.id' => $questionData['id']]));

            if ($random && $isRandomQuestionChoices) {
                $query = $this->getRandomSortedQuery($boolQuery, $seed);
                $query->setSort(['_score' => new \stdClass(), 'id' => new \stdClass()]);
                $query->setTrackTotalHits(true);
                $this->addObjectTypeFilter($query, $this->type);
            } else {
                $query = new Query();
                if (!$term) {
                    $functionScore = new Query\FunctionScore();
                    $functionScore
                        ->setBoostMode(Query\FunctionScore::BOOST_MODE_MAX)
                        ->setScoreMode(Query\FunctionScore::SCORE_MODE_SUM);
                    $functionScore->addFieldValueFactorFunction(
                        'position',
                        null,
                        Query\FunctionScore::FIELD_VALUE_FACTOR_MODIFIER_NONE,
                        0
                    );
                    $functionScore->setQuery($boolQuery);
                    $query->setQuery($functionScore);
                    $query->setSort(['_score' => ['order' => 'asc'], 'id' => new \stdClass()]);
                } else {
                    $sanitizedTerm = Sanitizer::escape($term, [' ']);
                    $boolQuery
                        ->addShould(
                            (new Query\MatchPhrasePrefix())
                                ->setFieldQuery('label', $sanitizedTerm)
                                ->setFieldMaxExpansions('label')
                        )
                        ->addShould(
                            (new Query\QueryString(
                                $sanitizedTerm . '~' . self::FUZZINNESS_LEVEL
                            ))->setFields(['label'])
                        )
                        ->addShould(new Query\MatchQuery('label', $sanitizedTerm));
                    $query->setQuery($boolQuery);
                    $query->setSort(['_score' => ['order' => 'desc'], 'id' => new \stdClass()]);
                    $query->setMinScore(0.1);
                }
                $query->setTrackTotalHits(true);
                $this->addObjectTypeFilter($query, $this->type);
            }

            if ($cursor) {
                $this->applyCursor($query, $cursor);
            }
            if ($limit) {
                $query->setSize($limit + 1);
            }
            $searchQuery->setQuery($query);
            $multiSearchQuery->addSearch($searchQuery);
        }

        $responses = $multiSearchQuery->search();
        $results = [];
        foreach ($responses->getResultSets() as $key => $resultSet) {
            $results[] = new ElasticsearchPaginatedResult(
                $this->getHydratedResultsFromResultSet($this->choiceRepository, $resultSet),
                $this->getCursors($resultSet),
                $resultSet->getTotalHits()
            );
        }

        return $results;
    }
}
