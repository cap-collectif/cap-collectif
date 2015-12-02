<?php

namespace Capco\AppBundle\Resolver;

use Elastica\Filter\Bool;
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
     * @param string    $sort
     * @param string    $useTransformation
     * @param bool|true $useTransformation
     * @param array $filters
     *
     * @return array
     */
    public function searchAll($page = 1, $term = '', $type = 'all', $sort = 'score', $filters = [], $useTransformation = true, $resultsPerPage = self::RESULTS_PER_PAGE)
    {
        $results = [];
        $count = 0;
        $from = ($page - 1) * $resultsPerPage;

        $multiMatchQuery = empty(trim($term)) ? new Query\MatchAll() : $this->getMultiMatchQuery($term);
        $boolFilter = ($type || !empty($filters)) ? $this->getBoolFilter($type, $filters) : null;

        if ($multiMatchQuery && $boolFilter) {
            $query = new Filtered($multiMatchQuery, new Filter($boolFilter));
        } else {
            $query = $multiMatchQuery ? new Query($multiMatchQuery) : new Query($boolFilter);
        }

        if ($sort !== null && $sort !== 'score') {
            $query->setSort($this->getSortSettings($sort));
        }

        $query->setHighlight($this->getHighlightSettings());

        $query->setFrom($from);
        $query->setSize($resultsPerPage);

        $resultSet = $this->index->search($query);
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
            'title.std',
            'body.std',
            'object.std',
            'body.std',
            'teaser.std',
            'username.std',
            'biography.std',
        ]);

        $boolQuery->addMust($shouldQuery);
        $boolQuery->addShould($shouldQuery);

        return $boolQuery;
    }

    /**
     * @param $type
     * @param array $filters
     * @return Bool
     */
    public function getBoolFilter($type, array $filters)
    {
        $boolFilter = new Bool();

        if ('all' !== $type) {
            $boolFilter->addMust([
                'type' => $type
            ]);
        }

        foreach ($filters as $filterName => $filterValue) {
            $boolFilter->addMust([
                $filterName => $filterValue
            ]);
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
        $term = '_score';
        if ($sort === 'date') {
            $term = 'createdAt';
        }

        return [
            $term => [
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
                'object' => new \stdClass(),
                'body'   => new \stdClass(),
                'body'           => new \stdClass(),
                'teaser'         => new \stdClass(),
                'excerpt'        => new \stdClass(),
                'username'       => ['number_of_fragments' => 0],
                'biography'      => new \stdClass(),
            ],
        ];
    }
}
