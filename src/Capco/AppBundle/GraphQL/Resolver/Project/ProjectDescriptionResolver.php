<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectDescriptionResolver implements ResolverInterface
{
    public function __invoke(Project $project): ?string
    {
        $steps = $project->getRealSteps();
        $firstStep = $steps[0] ?? null;

        if ($firstStep instanceof PresentationStep) {
            return $firstStep->getBody();
        }

        return null;
    }
}
