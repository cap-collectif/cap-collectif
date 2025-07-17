<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Client\OccitanieClient;
use Capco\AppBundle\Search\UserSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QueryContributorsResolver implements QueryInterface
{
    public $useElasticsearch = true;

    public function __construct(private readonly UserSearch $userSearch, private readonly OccitanieClient $occitanieClient)
    {
    }

    public function __invoke(?Arg $args = null): ConnectionInterface
    {
        $totalCount = 0;
        if (!$args) {
            $args = new Arg(['first' => 0]);
        }

        $paginator = new Paginator(function (int $offset, int $limit) use (&$totalCount) {
            $value = $this->userSearch->getAllContributors($offset, $limit);
            $totalCount = (int) $value['totalCount'];

            $instanceName = getenv('SYMFONY_INSTANCE_NAME');

            if (
                'occitanie-preprod' !== $instanceName
                && str_contains($instanceName, 'occitanie')
            ) {
                $totalCount = $this->occitanieClient->getUserCounters();
            }

            return $value['results'];
        });

        // TODO: This resolver uses the old ES pagination method
        // Please use the Elasticsearch Paginator and implement cursor management in the getAllContributors function.

        $connection = $paginator->auto($args, $totalCount);

        $connection->setTotalCount($totalCount);
        $connection->{'anonymousCount'} = 0;

        return $connection;
    }
}
