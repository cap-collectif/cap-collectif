<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Search\ProjectSearch;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Definition\Argument;

class QueryContributionsResolver implements ResolverInterface
{
    protected $projectSearch;

    public function __construct(ProjectSearch $projectSearch)
    {
        $this->projectSearch = $projectSearch;
    }

    public function __invoke(Argument $args): int
    {
        return $this->projectSearch->getAllContributions();
    }
}
