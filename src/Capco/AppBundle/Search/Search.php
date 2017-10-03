<?php

namespace Capco\AppBundle\Search;

use Elastica\Index;
use Elastica\Query;
use FOS\ElasticaBundle\Transformer\ElasticaToModelTransformerInterface;

abstract class Search
{
    const RESULTS_PER_PAGE = 10;

    protected $index;
    protected $transformer;
    protected $validator;
    protected $type;

    public function __construct(Index $index, ElasticaToModelTransformerInterface $transformer, $validator)
    {
        $this->index = $index;
        $this->transformer = $transformer;
        $this->validator = $validator;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function searchTermsInField(Query\BoolQuery $query, string $field = '', array $terms = []): Query\BoolQuery
    {
        $termsQuery = new Query\Terms($field, $terms);

        $query->addMust($termsQuery);

        return $query;
    }

    public function searchTermsInMultipleFields(Query\BoolQuery $query, array $fields, $terms = null): Query\BoolQuery
    {
        if (empty(trim($terms))) {
            $multiMatchQuery = new Query\MatchAll();
        } else {
            $multiMatchQuery = new Query\MultiMatch();
            $multiMatchQuery
                ->setQuery($terms)
                ->setFields($fields);
        }

        $query->addMust($multiMatchQuery);

        return $query;
    }

    public function searchNotInTermsForField(Query\BoolQuery $query, $fieldName, $terms): Query\BoolQuery
    {
        if (is_array($terms)) {
            $matchQuery = new Query\Terms($fieldName, $terms);
        } else {
            $matchQuery = new Query\Match($fieldName, $terms);
        }

        $query->addMustNot($matchQuery);

        return $query;
    }

    public function getResults(Query\BoolQuery $queryToExecute, int $size = null, bool $hybridResults): array
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
}
