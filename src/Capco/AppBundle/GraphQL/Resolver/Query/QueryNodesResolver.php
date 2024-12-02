<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\GraphQL\QueryAnalyzer;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryNodesResolver implements QueryInterface
{
    public function __construct(private readonly GlobalIdResolver $globalIdResolver, private readonly QueryAnalyzer $queryAnalyzer)
    {
    }

    public function __invoke(
        array $ids,
        $viewer,
        \ArrayObject $context,
        ResolveInfo $resolveInfo
    ): array {
        $this->queryAnalyzer->analyseQuery($resolveInfo);

        $results = [];
        foreach ($ids as $id) {
            $results[] = $this->globalIdResolver->resolve($id, $viewer, $context);
        }

        return $results;
    }
}
