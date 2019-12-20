<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectStepsResolver implements ResolverInterface
{
    public function __invoke(Project $project): iterable
    {
        $steps = $project->getRealSteps();
        usort($steps, function ($a, $b) {
            return $a->getPosition() <=> $b->getPosition();
        });

        return $steps;
    }
}
