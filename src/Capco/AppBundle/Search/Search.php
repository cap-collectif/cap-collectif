<?php

namespace Capco\AppBundle\Search;

use Doctrine\ORM\EntityRepository;
use Elastica\Index;
use Elastica\Query;
use Elastica\Result;
use Elastica\ResultSet;

abstract class Search
{
    public const RESULTS_PER_PAGE = 10;

    public const AVAILABLE_TYPES_FOR_MULTI_MATCH = [
        Query\MultiMatch::TYPE_BEST_FIELDS,
        Query\MultiMatch::TYPE_MOST_FIELDS,
        Query\MultiMatch::TYPE_CROSS_FIELDS,
        Query\MultiMatch::TYPE_PHRASE,
        Query\MultiMatch::TYPE_PHRASE_PREFIX
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

    protected function getHydratedResults(EntityRepository $repository, array $ids): array
    {
        // We can't use findById because we would lost the correct order given by ES
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        $results = $repository->hydrateFromIds($ids);
        // We have to restore the correct order of ids, because Doctrine has lost it, see:
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        usort($results, static function ($a, $b) use ($ids) {
            return array_search($a->getId(), $ids, false) > array_search($b->getId(), $ids, false);
        });

        return $results;
    }

    protected function getHydratedResultsFromResultSet(
        EntityRepository $repository,
        ResultSet $resultSet
    ): array {
        $ids = array_map(static function (Result $result) {
            return $result->getData()['id'];
        }, $resultSet->getResults());

        return $this->getHydratedResults($repository, $ids);
    }

    protected function getRandomSortedQuery(Query\AbstractQuery $query, int $seed = 123): Query
    {
        $functionScore = new Query\FunctionScore();
        $functionScore->setQuery($query);
        $functionScore->setRandomScore($seed);

        return new Query($functionScore);
    }
}
