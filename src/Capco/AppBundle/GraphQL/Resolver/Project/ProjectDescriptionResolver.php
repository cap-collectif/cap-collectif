<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProjectDescriptionResolver implements QueryInterface
{
    public function __invoke(Project $project): ?string
    {
        return $project->getFirstStep() instanceof PresentationStep ? $project->getFirstStep()->getBody() : null;
    }
}
