<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProjectStatusResolver implements QueryInterface
{
    public function __invoke(Project $project): int
    {
        return $project->getCurrentStepState();
    }
}
