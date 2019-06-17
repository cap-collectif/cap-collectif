<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use GraphQL\Type\Definition\ResolveInfo;
use Capco\AppBundle\GraphQL\QueryAnalyzer;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryNodeResolver implements ResolverInterface
{
    private $globalIdResolver;
    private $queryAnalyzer;

    public function __construct(GlobalIdResolver $globalIdResolver, QueryAnalyzer $queryAnalyzer)
    {
        $this->globalIdResolver = $globalIdResolver;
        $this->queryAnalyzer = $queryAnalyzer;
    }

    public function __invoke(string $id, $viewer, \ArrayObject $context, ResolveInfo $resolveInfo)
    {
        $this->queryAnalyzer->analyseQuery($resolveInfo);

        return $this->globalIdResolver->resolve($id, $viewer, $context);
    }
}
