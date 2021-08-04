<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\GraphQL\DataLoader\Query\QueryAnalyticsDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class AnalyticsResolver implements ResolverInterface
{
    private QueryAnalyticsDataLoader $loader;

    public function __construct(QueryAnalyticsDataLoader $loader)
    {
        $this->loader = $loader;
    }

    public function __invoke(Argument $args): Promise
    {
        $filter = $args->offsetGet('filter');

        return $this->loader->load([
            'startAt' => $filter['startAt'],
            'endAt' => $filter['endAt'],
            'projectId' => $filter['projectId'],
            'topContributorsCount' => $filter['topContributorsCount'],
        ]);
    }
}
