<?php
/**
 * Created by PhpStorm.
 * User: jeff
 * Date: 03/10/2017
 * Time: 11:30.
 */

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

    public function searchAllUsers($terms = null, $without = null): array
    {
        $query = new Query\BoolQuery();

        $searchQuery = $this->searchTermsInMultipleFields($query, self::SEARCH_FIELDS, $terms);

        $results = $this->getResults($searchQuery, null, false);

        return [
            'users' => array_map(function ($result) {
                return $result->getSource();
            }, $results['results']),
            'count' => $results['count'],
        ];
    }
}
