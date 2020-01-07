<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Resolver\ContributionResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\ArgumentInterface;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ProjectContributionResolver implements ResolverInterface
{
    protected $contributionResolver;

    public function __construct(ContributionResolver $contributionResolver)
    {
        $this->contributionResolver = $contributionResolver;
    }

    public function __invoke(Project $project, ?ArgumentInterface $args = null): ConnectionInterface
    {
        if (!$args) {
            $args = new Arg(['first' => 0]);
        }
        $totalCount = $this->contributionResolver->countProjectContributions($project);

        $paginator = new Paginator(static function (int $offset, int $limit) {
            return [];
        });

        return $paginator->auto($args, $totalCount);
    }

    public function getContributionsCount(Project $project): int
    {
        return $this->contributionResolver->countProjectContributions($project);
    }
}
