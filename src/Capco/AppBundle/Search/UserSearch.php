<?php

namespace Capco\AppBundle\Search;

use Capco\AppBundle\Elasticsearch\ElasticaToDoctrineTransformer;
use Elastica\Index;
use Elastica\Query;

class UserSearch extends Search
{
    const SEARCH_FIELDS = [
        'username',
        'username.std',
    ];

    public function __construct(Index $index, ElasticaToDoctrineTransformer $transformer, $validator)
    {
        parent::__construct($index, $transformer, $validator);

        $this->type = 'user';
    }

    public function searchAllUsers($terms = null, $notInIds = []): array
    {
        $query = new Query\BoolQuery();

        if ($terms && !empty($terms)) {
            $query = $this->searchTermsInMultipleFields($query, self::SEARCH_FIELDS, $terms, 'phrase_prefix');
        }
        if (count($notInIds) > 0) {
            $query = $this->searchNotInTermsForField($query, 'id', $notInIds);
        }

        $results = $this->getResults($query, null, false);

        return [
            'users' => array_map(function ($result) {
                return $result->getSource();
            }, $results['results']),
            'count' => $results['count'],
        ];
    }
}
