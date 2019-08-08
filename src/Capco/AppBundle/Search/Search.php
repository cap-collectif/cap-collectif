<?php

namespace Capco\AppBundle\Search;

use Elastica\Index;
use Elastica\Query;

abstract class Search
{
    public const RESULTS_PER_PAGE = 10;

    public const AVAILABLE_TYPES_FOR_MULTI_MATCH = [
        Query\MultiMatch::TYPE_BEST_FIELDS,
        Query\MultiMatch::TYPE_MOST_FIELDS,
        Query\MultiMatch::TYPE_CROSS_FIELDS,
        Query\MultiMatch::TYPE_PHRASE,
        Query\MultiMatch::TYPE_PHRASE_PREFIX,
    ];

    protected $index;
    protected $type;

    public function __construct(Index $index)
    {
        $this->index = $index;
    }

    protected function searchTermsInMultipleFields(
        Query\BoolQuery $query,
        array $fields,
        $terms = null,
        $type = null
    ): Query\BoolQuery {
        if (empty(trim($terms))) {
            $multiMatchQuery = new Query\MatchAll();
        } else {
            $multiMatchQuery = new Query\MultiMatch();
            $multiMatchQuery->setQuery($terms)->setFields($fields);

            if ($type && \in_array($type, self::AVAILABLE_TYPES_FOR_MULTI_MATCH, true)) {
                $multiMatchQuery->setType($type);
            }
        }

        $query->addMust($multiMatchQuery);

        return $query;
    }

    protected function searchNotInTermsForField(
        Query\BoolQuery $query,
        $fieldName,
        $terms
    ): Query\BoolQuery {
        if (\is_array($terms)) {
            $matchQuery = new Query\Terms($fieldName, $terms);
        } else {
            $matchQuery = new Query\Match($fieldName, $terms);
        }

        $query->addMustNot($matchQuery);

        return $query;
    }

    protected function getRandomSortedQuery(Query\AbstractQuery $query, int $seed = 123): Query
    {
        $functionScore = new Query\FunctionScore();
        $functionScore->setQuery($query);
        $functionScore->setRandomScore($seed);

        return new Query($functionScore);
    }
}
