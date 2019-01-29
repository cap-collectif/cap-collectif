<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Search\UserSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryContributorsResolver implements ResolverInterface
{
    public $useElasticsearch = true;
    private $userSearch;

    public function __construct(UserSearch $userSearch)
    {
        $this->userSearch = $userSearch;
    }

    public function __invoke(?Arg $args = null): Connection
    {
        $totalCount = 0;
        if (!$args) {
            $args = new Arg(['first' => 0]);
        }
        $paginator = new Paginator(function (int $offset, int $limit) use (&$totalCount) {
            if ($this->useElasticsearch) {
                $value = $this->userSearch->getAllContributors($offset, $limit);
                $contributors = $value['results'];
                $totalCount = $value['totalCount'];

                return $contributors;
            }

            return [];
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->totalCount = $totalCount;
        $connection->{'anonymousCount'} = 0;

        return $connection;
    }
}
