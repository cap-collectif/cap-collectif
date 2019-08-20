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
            $value = $this->userSearch->getAllContributors($offset, $limit);
            $totalCount = (int) $value['totalCount'];

            return $value['results'];
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);
        $connection->{'anonymousCount'} = 0;

        return $connection;
    }
}
