<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\StepResolver;
use Twig\Extension\RuntimeExtensionInterface;

class StepsRuntime implements RuntimeExtensionInterface
{
    protected $resolver;

    public function __construct(StepResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFirstStepLink($project, $absolute = false)
    {
        return $this->resolver->getFirstStepLinkForProject($project, $absolute);
    }
}
