<?php

namespace Capco\AppBundle\Resolver;

use Elastica\Filter\Bool;
use Elastica\Filter\BoolFilter;
use Elastica\Filter\Nested;
use Elastica\Filter\Term;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\MultiMatch;
use Elastica\Query\Filtered;
use Elastica\Query\FunctionScore;
use Elastica\Query\AbstractQuery;
use Elastica\Filter\Type;
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
     * Search by term and type in elasticsearch.
     *
     * @param int       $page
     * @param string    $term
     * @param string    $type
     * @param string    $sortField
     * @param string    $sortOrder
     * @param bool|true $useTransformation
     * @param array     $filters
     *
     * @return array
     */
    public function searchAll($page = 1, $term = '', $type = 'all', $sortField = '_score', $sortOrder = 'DESC', $filters = [], $useTransformation = true, $resultsPerPage = self::RESULTS_PER_PAGE, $random = false)
    {
        $results = [];
        $count = 0;
        $from = ($page - 1) * $resultsPerPage;

        $multiMatchQuery = empty(trim($term)) ? new Query\MatchAll() : $this->getMultiMatchQuery($term);
        $boolFilter = !empty($filters) ? $this->getBoolFilter($filters) : null;

        if ($multiMatchQuery && $boolFilter) {
            $abstractQuery = new Filtered($multiMatchQuery, $boolFilter);
        } else {
            $abstractQuery = $multiMatchQuery ? $multiMatchQuery : $boolFilter;
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
            'pages' => ceil($count / $resultsPerPage),
        ];
    }

    /**
     * Get random sorted query
     *
     * @param AbstractQuery $query
     *
     * @return FunctionScore
     */
    protected function getRandomSortedQuery(AbstractQuery $query)
    {
        $functionScore = new FunctionScore();
        $functionScore->setQuery($query);
        $functionScore->setRandomScore();
        return new Query($functionScore);

    }

    /**
     * Get multi match query on term.
     *
     * @param $term
     *
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
     * or nested filters (path => [filters]).
     *
     * @param $type
     * @param array $filters
     *
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
                    $filterName => $filterData,
                ]));
            }
        }

        return $boolFilter;
    }

    /**
     * @param $sort
     * @param string $order
     *
     * @return array|void
     */
    protected function getSortSettings($sort = '_score', $order = 'desc')
    {
        $sort = $sort ? $sort : '_score';
        $order = $order ? $order : 'desc';
        $missing = $order === 'desc' ? 1 - PHP_INT_MAX : PHP_INT_MAX - 1;

        return [
            $sort => [
                'order' => $order,
                'missing' => $missing,
            ]
        ];
    }

    /**
     * get array of settings for highlighted results.
     *
     * @return array
     */
    protected function getHighlightSettings()
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

    public function searchProposals($page, $pagination, $order, $terms, $providedFilters)
    {
        $type = 'proposal';

        switch ($order) {
            case 'old':
                $sortField = 'created_at';
                $sortOrder = 'asc';
                break;
            case 'last':
                $sortField = 'created_at';
                $sortOrder = 'desc';
                break;
            case 'votes':
                $sortField = $providedFilters['selectionStep']
                    ? 'votesCountBySelectionSteps.'.$providedFilters['selectionStep']
                    : 'created_at'
                ;
                $sortOrder = 'desc';
                break;
            case 'comments':
                $sortField = 'comments_count';
                $sortOrder = 'desc';
                break;
            default;
                $sortField = '_score';
                $sortOrder = 'desc';
                break;
        }

        $filters = [];
        $filters['isTrashed'] = false;
        $filters['enabled'] = true;
        if (array_key_exists('selectionStep', $providedFilters)) {
            $filters['selectionSteps.id'] = $providedFilters['selectionStep'];
        }
        if (array_key_exists('proposalForm', $providedFilters)) {
            $filters['proposalForm.id'] = $providedFilters['proposalForm'];
        }
        if (array_key_exists('status', $providedFilters) && $providedFilters['status'] > 0) {
            $filters['status.id'] = $providedFilters['status'];
        }
        if (array_key_exists('district', $providedFilters) && $providedFilters['district'] > 0) {
            $filters['district.id'] = $providedFilters['district'];
        }
        if (array_key_exists('theme', $providedFilters) && $providedFilters['theme'] > 0) {
            $filters['theme.id'] = $providedFilters['theme'];
        }
        if (array_key_exists('type', $providedFilters) && $providedFilters['type'] > 0) {
            $filters['author.user_type.id'] = $providedFilters['type'];
        }

        // Search
        $results = $this->searchAll(
            $page,
            $terms,
            $type,
            $sortField,
            $sortOrder,
            $filters,
            false,
            $pagination,
            $order === 'random'
        );

        $proposals = [];
        foreach ($results['results'] as $result) {
            $proposals[] = $result->getHit()['_source'];
        }

        return [
            'proposals' => $proposals,
            'count' => $results['count'],
            'order' => $order,
        ];
    }
}
