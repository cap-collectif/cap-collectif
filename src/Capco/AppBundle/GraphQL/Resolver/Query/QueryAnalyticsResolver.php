<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\GraphQL\DataLoader\Query\QueryAnalyticsDataLoader;
use GraphQL\Executor\Promise\Promise;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryAnalyticsResolver implements QueryInterface
{
    private QueryAnalyticsDataLoader $loader;

    public function __construct(QueryAnalyticsDataLoader $loader)
    {
        $this->loader = $loader;
    }

    public function __invoke(Argument $args, ResolveInfo $resolveInfo): Promise
    {
        $filter = $args->offsetGet('filter');
        $requestedFields = [];
        $queryPlan = $resolveInfo->lookAhead();
        foreach ($queryPlan->getReferencedTypes() as $type) {
            foreach ($queryPlan->subFields($type) as $field) {
                $requestedFields[] = $field;
            }
        }

        return $this->loader->load([
            'startAt' => $filter['startAt'],
            'endAt' => $filter['endAt'],
            'projectId' => $filter['projectId'],
            'requestedFields' => $requestedFields,
            'topContributorsCount' => $filter['topContributorsCount'],
        ]);
    }
}
