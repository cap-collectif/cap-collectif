<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\StepResolver;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class StepsExtension extends AbstractExtension
{
    protected $resolver;

    public function __construct(StepResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFilters(): array
    {
        return [new TwigFilter('capco_first_step_link', [$this, 'getFirstStepLink'])];
    }

    public function getFirstStepLink($project, $absolute = false)
    {
        return $this->resolver->getFirstStepLinkForProject($project, $absolute);
    }
}
