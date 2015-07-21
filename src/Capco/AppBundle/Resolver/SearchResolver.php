<?php

namespace Capco\AppBundle\Resolver;

use FOS\ElasticaBundle\Finder\FinderInterface;

use Elastica\Query;
use Elastica\Query\Bool;
use Elastica\Query\MultiMatch;
use Elastica\Query\Filtered;
use Elastica\Filter\Type;

class SearchResolver
{
    protected $finder;

    public function __construct(FinderInterface $finder)
    {
        $this->finder = $finder;
    }

    // search by term and type in elasticsearch
    public function searchAll($term, $type = 'all', $sort = 'score')
    {
        $results = array();

        if ($term) {

            $termQuery = $this->getTermQuery($term);

            if ('all' !== $type) {
                $query = new Query($this->getTypeFilteredQuery($type, $termQuery));
            } else {
                $query = new Query($termQuery);
            }

            $query->setSize(10);
            $query->setFrom(0);

            if ($sort !== 'score') {
                $query->setSort($this->getSortSettings($sort));
            }

            $query->setHighlight($this->getHighlightSettings());

            // Returns a mixed array of any objects mapped + highlights
            $results = $this->finder->findHybrid($query);
        }

        return $results;
    }

    // get filtered query with type filter and term query
    public function getTypeFilteredQuery($type, $termQuery)
    {
        $typeFilter = new Type($type);
        return new Filtered($termQuery, $typeFilter);
    }

    // get multi match query on term
    protected function getTermQuery($term)
    {
        $termQuery = new MultiMatch();
        $termQuery->setQuery($term);
        $termQuery->setFields([
            'title^5',
            'strippedBody',
            'strippedObject',
            'body',
            'teaser',
            'excerpt',
            'username^5',
            'biography',
        ]);
        return $termQuery;
    }

    protected function getSortSettings($sort)
    {
        $term = null;
        if ($sort === 'date') {
            $term = 'updatedAt';
        }
        if ($term === null) {
            return;
        }

        return [
            $term => [
                "order" => "desc",
            ],
        ];

    }

    // get array of settings for highlighted results
    protected function getHighlightSettings()
    {
        return [
            "pre_tags" => ["<span class=\"search__highlight\">"],
            "post_tags" => ["</span>"],
            "number_of_fragments" => 3,
            "fragment_size" => 175,
            "fields" => [
                "title" => ['number_of_fragments' => 0,],
                "strippedObject" => new \stdClass,
                "strippedBody" => new \stdClass,
                "body" => new \stdClass,
                "teaser" => new \stdClass,
                "excerpt" => new \stdClass,
                "username" => ['number_of_fragments' => 0,],
                "biography" => new \stdClass,
            ]
        ];
    }
}
