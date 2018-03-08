<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticaToDoctrineTransformer;
use Elastica\Filter\BoolFilter;
use Elastica\Filter\Nested;
use Elastica\Filter\Term;
use Elastica\Index;
use Elastica\Query;

abstract class Search
{
    const RESULTS_PER_PAGE = 10;

    const AVAILABLE_TYPES_FOR_MULTI_MATCH = [
        Query\MultiMatch::TYPE_BEST_FIELDS,
        Query\MultiMatch::TYPE_MOST_FIELDS,
        Query\MultiMatch::TYPE_CROSS_FIELDS,
        Query\MultiMatch::TYPE_PHRASE,
        Query\MultiMatch::TYPE_PHRASE_PREFIX,
    ];

    protected $index;
    protected $transformer;
    protected $validator;
    protected $type;

    public function __construct(Index $index, ElasticaToDoctrineTransformer $transformer, $validator)
    {
        $this->index = $index;
        $this->transformer = $transformer;
        $this->validator = $validator;
    }

    protected function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    protected function searchTermsInField(Query\BoolQuery $query, string $fieldName, $terms): Query\BoolQuery
    {
        if (is_array($terms)) {
            $termsQuery = new Query\Terms($fieldName, $terms);
        } else {
            $termsQuery = new Query\Match($fieldName, $terms);
        }

        $query->addMust($termsQuery);

        return $query;
    }

    protected function searchTermsInMultipleFields(Query\BoolQuery $query, array $fields, $terms = null, $type = null): Query\BoolQuery
    {
        if (empty(trim($terms))) {
            $multiMatchQuery = new Query\MatchAll();
        } else {
            $multiMatchQuery = new Query\MultiMatch();
            $multiMatchQuery
                ->setQuery($terms)
                ->setFields($fields);

            if ($type && in_array($type, self::AVAILABLE_TYPES_FOR_MULTI_MATCH, true)) {
                $multiMatchQuery->setType($type);
            }
        }

        $query->addMust($multiMatchQuery);

        return $query;
    }

    protected function searchNotInTermsForField(Query\BoolQuery $query, $fieldName, $terms): Query\BoolQuery
    {
        if (is_array($terms)) {
            $matchQuery = new Query\Terms($fieldName, $terms);
        } else {
            $matchQuery = new Query\Match($fieldName, $terms);
        }

        $query->addMustNot($matchQuery);

        return $query;
    }

    protected function getResults(Query\BoolQuery $queryToExecute, int $size = null, bool $hybridResults = true): array
    {
        $query = new Query();
        $query
            ->setQuery($queryToExecute)
            ->setSize($size ?? self::RESULTS_PER_PAGE);

        $search = $this->index->getType($this->type)->search($query);
        $totalHits = $search->getTotalHits();

        if ($hybridResults) {
            $results = $this->transformer->hybridTransform($search->getResults());
        } else {
            $results = $search->getResults();
        }

        return [
            'count' => $totalHits,
            'results' => $results,
        ];
    }

    protected function getRandomSortedQuery(Query\AbstractQuery $query): Query
    {
        $functionScore = new Query\FunctionScore();
        $functionScore->setQuery($query);
        $functionScore->setRandomScore();

        return new Query($functionScore);
    }

    protected function getBoolFilter(array $filters): BoolFilter
    {
        $boolFilter = new BoolFilter();

        foreach ($filters as $filterName => $filterData) {
            if (is_array($filterData)) {
                $nested = new Nested();
                $nested->setPath($filterName);
                $nested->setFilter($this->getBoolFilter($filterData));
                $boolFilter->addMust($nested);
            } else {
                $boolFilter->addMust(new Term([
                    $filterName => $filterData,
                ]));
            }
        }

        return $boolFilter;
    }

    protected function addSort(Query $query, string $sort = '_score', string $order = 'desc')
    {
        $query
            ->addSort([
                $sort => [
                    'order' => $order,
                    'missing' => 'desc' === $order ? 1 - PHP_INT_MAX : PHP_INT_MAX - 1,
                ],
            ]);
    }
}
