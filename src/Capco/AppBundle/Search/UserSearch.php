<?php

namespace Capco\AppBundle\Search;

use Elastica\Index;
use Elastica\Query;
use FOS\ElasticaBundle\Transformer\ElasticaToModelTransformerInterface;

class UserSearch extends Search
{
    const SEARCH_FIELDS = [
        'username',
        'username.std',
    ];

    public function __construct(Index $index, ElasticaToModelTransformerInterface $transformer, $validator)
    {
        parent::__construct($index, $transformer, $validator);

        $this->type = 'user';
    }

    public function searchAllUsers($terms = null, $notInIds = null): array
    {
        $query = new Query\BoolQuery();

        $query = $this->searchTermsInMultipleFields($query, self::SEARCH_FIELDS, $terms, 'phrase_prefix');
        $query = $this->searchNotInTermsForField($query, 'id', $notInIds);

        $results = $this->getResults($query, null, false);

        return [
            'users' => array_map(function ($result) {
                return $result->getSource();
            }, $results['results']),
            'count' => $results['count'],
        ];
    }
}
