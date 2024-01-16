<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProjectHasAnalysisResolver implements QueryInterface
{
    public function __invoke(Project $project): bool
    {
        return null != $project->getFirstAnalysisStep();
    }
}
