<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Resolver\StepResolver;
use Twig\Extension\RuntimeExtensionInterface;

class StepsRuntime implements RuntimeExtensionInterface
{
    protected StepResolver $resolver;

    public function __construct(StepResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFirstStepLink(Project $project, bool $absolute = false): string
    {
        return $this->resolver->getFirstStepLinkForProject($project, $absolute);
    }
}
