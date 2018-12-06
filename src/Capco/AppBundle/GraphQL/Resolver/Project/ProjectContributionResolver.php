<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Resolver\ContributionResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectContributionResolver implements ResolverInterface
{
    protected $contributionResolver;

    public function __construct(ContributionResolver $contributionResolver)
    {
        $this->contributionResolver = $contributionResolver;
    }

    public function __invoke(Project $project): int
    {
        return $this->contributionResolver->countProjectContributions($project);
    }
}
