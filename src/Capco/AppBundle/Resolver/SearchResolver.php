<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Elasticsearch\ElasticaToDoctrineTransformer;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\AbstractQuery;
use Elastica\Query\FunctionScore;
use Elastica\Query\MultiMatch;
use Elastica\Query\Nested;
use Elastica\Query\Term;

class SearchResolver
{
    const RESULTS_PER_PAGE = 10;

    protected $index;
    protected $transformer;
    protected $validator;

    public function __construct(Index $index, ElasticaToDoctrineTransformer $transformer, $validator)
    {
        $this->index = $index;
        $this->transformer = $transformer;
        $this->validator = $validator;
    }

    /**
     * Search by term and type in elasticsearch.
     *
     * @param int       $page
     * @param string    $term
     * @param string    $type
     * @param string    $sortField
     * @param string    $sortOrder
     * @param array     $filters
     * @param bool|true $useTransformation
     * @param int       $resultsPerPage
     * @param bool      $random
     *
     * @return array
     */
    public function searchAll($page = 1, $term = '', $type = 'all', $sortField = '_score', $sortOrder = 'DESC', $filters = [], $useTransformation = true, $resultsPerPage = self::RESULTS_PER_PAGE, $random = false)
    {
        $from = ($page - 1) * $resultsPerPage;

        $multiMatchQuery = empty(trim($term)) ? new Query\MatchAll() : $this->getMultiMatchQuery($term);
        $boolFilter = !empty($filters) ? $this->getBoolFilter($filters) : null;

        if ($multiMatchQuery && $boolFilter) {
            $abstractQuery = new Query\BoolQuery();
            $abstractQuery->addFilter($boolFilter);
            $abstractQuery->addMust($multiMatchQuery);
        } else {
            $abstractQuery = $multiMatchQuery ?: $boolFilter;
        }

        if ($random) {
            $query = $this->getRandomSortedQuery($abstractQuery);
        } else {
            $query = new Query($abstractQuery);
        }

        $query->setSort($this->getSortSettings($sortField, $sortOrder));

        $query->setHighlight($this->getHighlightSettings());

        $query->setFrom($from);
        $query->setSize($resultsPerPage);

        if ($type && 'all' !== $type) {
            $resultSet = $this->index->getType($type)->search($query);
        } else {
            $resultSet = $this->index->search($query);
        }

        $count = $resultSet->getTotalHits();

        $results = $useTransformation
            ? $this->transformer->hybridTransform($resultSet->getResults())
            : $resultSet->getResults()
        ;

        return [
            'count' => $count,
            'results' => $results,
            'pages' => ceil($count / $resultsPerPage),
        ];
    }

    /**
     * Take an array of filters and return correct elastica object.
     * The array of filters can contain either simple filters (fieldName => value)
     * or nested filters (path => [filters]).
     */
    public function getBoolFilter(array $filters): Query\BoolQuery
    {
        $boolFilter = new Query\BoolQuery();

        foreach ($filters as $filterName => $filterData) {
            if (is_array($filterData)) {
                $nested = new Nested();
                $nested->setPath($filterName);
                $nested->setQuery($this->getBoolFilter($filterData));
                $boolFilter->addMust($nested);
            } else {
                $boolFilter->addMust(new Term([
                    $filterName => $filterData,
                ]));
            }
        }

        return $boolFilter;
    }

    protected function getRandomSortedQuery(AbstractQuery $query): Query
    {
        $functionScore = new FunctionScore();
        $functionScore->setQuery($query);
        $functionScore->setRandomScore();

        return new Query($functionScore);
    }

    protected function getMultiMatchQuery($term): Query\BoolQuery
    {
        $boolQuery = new Query\BoolQuery();

        $shouldQuery = new MultiMatch();
        $shouldQuery->setQuery($term);
        $shouldQuery->setFields([
            'title', 'title.std',
            'body', 'body.std',
            'object', 'object.std',
            'teaser', 'teaser.std',
            'username', 'username.std',
            'biography', 'biography.std',
        ]);

        $boolQuery->addMust($shouldQuery);
        $boolQuery->addShould($shouldQuery);

        return $boolQuery;
    }

    protected function getSortSettings(string $sort = '_score', string $order = 'desc'): array
    {
        if ('_score' === $sort) {
            return [
                $sort => ['order' => $order],
            ];
        }

        return [
            $sort => [
                'order' => $order,
            ],
        ];
    }

    protected function getHighlightSettings(): array
    {
        return [
            'pre_tags' => ['<span class="search__highlight">'],
            'post_tags' => ['</span>'],
            'number_of_fragments' => 3,
            'fragment_size' => 175,
            'fields' => [
                'title' => ['number_of_fragments' => 0],
                'object' => new \stdClass(),
                'body' => new \stdClass(),
                'teaser' => new \stdClass(),
                'excerpt' => new \stdClass(),
                'username' => ['number_of_fragments' => 0],
                'biography' => new \stdClass(),
            ],
        ];
    }
}
