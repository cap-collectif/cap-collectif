<?php

namespace Capco\AppBundle\Search;

use Elastica\Query;

class GlobalSearch extends Search
{
    const SEARCH_FIELDS = [
        'title',
        'title.std',
        'reference',
        'reference.std',
        'body',
        'body.std',
        'object',
        'object.std',
        'teaser',
        'teaser.std',
        'username',
        'username.std',
        'biography',
        'biography.std',
    ];

    public function search($page, $terms, $sortField, $sortOrder, $useTransformation = true): array
    {
        $pagination = self::RESULTS_PER_PAGE;

        $from = ($page - 1) * $pagination;

        $query = new Query\BoolQuery();

        $query = $this->searchTermsInMultipleFields($query, self::SEARCH_FIELDS, $terms, 'phrase_prefix');

        $query = new Query($query);

        $this->addSort($query, $sortField, $sortOrder);
        $query->setHighlight($this->getHighlightSettings());

        $query->setFrom($from);
        $query->setSize($pagination);

        $resultSet = $this->index->search($query);

        $count = $resultSet->getTotalHits();

        if ($useTransformation) {
            $results = $this->transformer->hybridTransform($resultSet->getResults());
        } else {
            $results = $resultSet->getResults();
        }

        return [
            'count' => $count,
            'results' => $results,
            'pages' => ceil($count / $pagination),
        ];
    }

    private function getHighlightSettings(): array
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
