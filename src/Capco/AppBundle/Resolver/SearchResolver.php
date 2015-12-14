<?php

namespace Capco\AppBundle\Resolver;

use Elastica\Filter\Bool;
use Elastica\Filter\BoolFilter;
use Elastica\Filter\Nested;
use Elastica\Filter\Term;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\AbstractQuery;
use Elastica\Query\Bool as BoolQuery;
use Elastica\Query\MultiMatch;
use Elastica\Query\Filtered;
use Elastica\Filter\Type;
use Elastica\QueryBuilder;
use FOS\ElasticaBundle\Transformer\ElasticaToModelTransformerInterface;

class SearchResolver
{
    const RESULTS_PER_PAGE = 10;

    protected $index;
    protected $transformer;

    public function __construct(Index $index, ElasticaToModelTransformerInterface $transformer)
    {
        $this->index = $index;
        $this->transformer = $transformer;
    }

    /**
     * Search by term and type in elasticsearch
     *
     * @param integer   $page
     * @param string    $term
     * @param string    $type
     * @param string    $sortField
     * @param string    $sortOrder
     * @param bool|true $useTransformation
     * @param array $filters
     *
     * @return array
     */
    public function searchAll($page = 1, $term = '', $type = 'all', $sortField = '_score', $sortOrder = 'DESC', $filters = [], $useTransformation = true, $resultsPerPage = self::RESULTS_PER_PAGE)
    {
        $results = [];
        $count = 0;
        $from = ($page - 1) * $resultsPerPage;

        $multiMatchQuery = empty(trim($term)) ? new Query\MatchAll() : $this->getMultiMatchQuery($term);
        $boolFilter = !empty($filters) ? $this->getBoolFilter($filters) : null;

        if ($multiMatchQuery && $boolFilter) {
            $query = new Query(new Filtered($multiMatchQuery, $boolFilter));
        } else {
            $query = $multiMatchQuery ? new Query($multiMatchQuery) : new Query($boolFilter);
        }

        $query->setSort($this->getSortSettings($sortField, $sortOrder));

        $query->setHighlight($this->getHighlightSettings());

        $query->setFrom($from);
        $query->setSize($resultsPerPage);

        if ($type && $type !== 'all') {
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
            'pages' => ceil($count / $resultsPerPage)
        ];
    }

    /**
     * Get multi match query on term
     *
     * @param $term
     * @return MultiMatch
     */
    protected function getMultiMatchQuery($term)
    {
        $boolQuery = new Query\Bool();

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

    /**
     * Take an array of filters and return correct elastica object.
     * The array of filters can contain either simple filters (fieldName => value)
     * or nested filters (path => [filters])
     * @param $type
     * @param array $filters
     * @return BoolFilter
     */
    public function getBoolFilter(array $filters)
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
                    $filterName => $filterData
                ]));
            }
        }

        return $boolFilter;
    }

    /**
     * @param $sort
     * @param string $order
     * @return array|void
     */
    protected function getSortSettings($sort, $order = 'desc')
    {
        $sort = $sort ? $sort : '_score';

        return [
            $sort => [
                'order' => $order,
            ],
            'createdAt' => [
                'order' => 'desc',
            ]
        ];
    }

    /**
     * get array of settings for highlighted results
     * @return array
     */
    protected function getHighlightSettings()
    {
        return [
            'pre_tags'            => ['<span class="search__highlight">'],
            'post_tags'           => ['</span>'],
            'number_of_fragments' => 3,
            'fragment_size'       => 175,
            'fields'              => [
                'title'          => ['number_of_fragments' => 0],
                'object'         => new \stdClass(),
                'body'           => new \stdClass(),
                'teaser'         => new \stdClass(),
                'excerpt'        => new \stdClass(),
                'username'       => ['number_of_fragments' => 0],
                'biography'      => new \stdClass(),
            ],
        ];
    }
}
