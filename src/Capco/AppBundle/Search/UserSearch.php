<?php

namespace Capco\AppBundle\Search;

use Capco\UserBundle\Entity\User;
use Elastica\Index;
use Elastica\Query;
use Elastica\Result;

class UserSearch extends Search
{
    const SEARCH_FIELDS = [
        'username',
        'username.std',
    ];

    private $userRepo;

    public function __construct(Index $index, $userRepo)
    {
        parent::__construct($index);
        $this->userRepo = $userRepo;
        $this->type = 'user';
    }

    public function searchAllUsers($terms = null, $notInIds = []): array
    {
        $query = new Query\BoolQuery();

        if ($terms) {
            $query = $this->searchTermsInMultipleFields($query, self::SEARCH_FIELDS, $terms, 'phrase_prefix');
        }
        if (count($notInIds) > 0) {
            $query = $this->searchNotInTermsForField($query, 'id', $notInIds);
        }

        $resultSet = $this->index->getType($this->type)->search($query);

        return [
            'users' => $this->getHydratedResults($resultSet->getResults()),
            'count' => $resultSet->getTotalHits(),
        ];
    }

    private function getHydratedResults(array $results): array
    {
        // We can't use findById because we would lost the correct order given by ES
        // https://stackoverflow.com/questions/28563738/symfony-2-doctrine-find-by-ordered-array-of-id/28578750
        return array_values(array_filter(array_map(function (Result $result) {
            return $this->userRepo->findOneBy(['id' => $result->getData()['id']]);
        }, $results), function (?User $user) {return null !== $user; }));
    }
}
