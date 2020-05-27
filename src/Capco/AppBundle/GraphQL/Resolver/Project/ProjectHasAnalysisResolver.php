<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectHasAnalysisResolver implements ResolverInterface
{
    public function __invoke(Project $project): bool
    {
        return null != $project->getFirstAnalysisStep();
    }
}
