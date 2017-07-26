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
use Elastica\Result;
use Symfony\Component\Validator\Constraints\Uuid;

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
     * Take an array of filters and return correct elastica object.
     * The array of filters can contain either simple filters (fieldName => value)
     * or nested filters (path => [filters]).
     *
     * @param array $filters
     *
     * @return Query\BoolQuery
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
                $stepId = $providedFilters['step'] ?? $providedFilters['selectionStep'];
                $sortField = 'votesCountByStepId.' . $stepId;
                $sortOrder = 'desc';
                break;
            case 'comments':
                $sortField = 'comments_count';
                $sortOrder = 'desc';
                break;
            default:
                $sortField = '_score';
                $sortOrder = 'desc';
                break;
        }

        $filters = [];
        $filters['isTrashed'] = false;
        $filters['enabled'] = true;
        if (array_key_exists('selectionStep', $providedFilters)) {
            $filters['selections.step.id'] = $providedFilters['selectionStep'];
        }
        if (array_key_exists('proposalForm', $providedFilters)) {
            $filters['proposalForm.id'] = $providedFilters['proposalForm'];
        }
        if (array_key_exists('statuses', $providedFilters) && $providedFilters['statuses'] > 0) {
            $filters['status.id'] = $providedFilters['statuses'];
        }
        if (array_key_exists('selectionStatuses', $providedFilters) && $providedFilters['selectionStatuses'] > 0) {
            $filters['selections.status.id'] = $providedFilters['selectionStatuses'];
        }
        if (isset($providedFilters['districts']) && $this->validator->validate($providedFilters['districts'], new Uuid())->count() === 0) {
            $filters['district.id'] = $providedFilters['districts'];
        }
        if (array_key_exists('themes', $providedFilters) && $providedFilters['themes'] > 0) {
            $filters['theme.id'] = $providedFilters['themes'];
        }
        if (array_key_exists('types', $providedFilters) && $providedFilters['types'] > 0) {
            $filters['author.user_type.id'] = $providedFilters['types'];
        }
        if (array_key_exists('categories', $providedFilters) && $providedFilters['categories'] > 0) {
            $filters['category.id'] = $providedFilters['categories'];
        }
        if (array_key_exists('authorUniqueId', $providedFilters)) {
            $filters['author.uniqueId'] = $providedFilters['authorUniqueId'];
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

        return [
            'proposals' => array_map(function (Result $result) {
                return $result->getSource();
            }, $results['results']),
            'count' => $results['count'],
            'order' => $order,
        ];
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
        if ($sort === '_score') {
            return [
                $sort => [  'order' => $order, ],
            ];
        }

        return [
            $sort => [
                'order' => $order,
                'missing' => ($order === 'desc' ? 1 - PHP_INT_MAX : PHP_INT_MAX - 1),
            ],
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
}
