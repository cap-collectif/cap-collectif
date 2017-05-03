<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Helper\StepHelper;
use Capco\AppBundle\Resolver\StepResolver;

class StepsExtension extends \Twig_Extension
{
    protected $resolver;
    protected $helper;

    public function __construct(StepResolver $resolver, StepHelper $helper)
    {
        $this->resolver = $resolver;
        $this->helper = $helper;
    }

    public function getFilters(): array
    {
        return [
            new \Twig_SimpleFilter('capco_step_link', [$this, 'getStepLink']),
            new \Twig_SimpleFilter('capco_first_step_link', [$this, 'getFirstStepLink']),
            new \Twig_SimpleFilter('capco_current_step_link', [$this, 'getCurrentStepLink']),
            new \Twig_SimpleFilter('capco_step_status', [$this, 'getStatus']),
        ];
    }

    public function getStepLink($step, $absolute = false)
    {
        return $this->resolver->getLink($step, $absolute);
    }

    public function getFirstStepLink($project, $absolute = false)
    {
        return $this->resolver->getFirstStepLinkForProject($project, $absolute);
    }

    public function getCurrentStepLink($project, $absolute = false)
    {
        return $this->resolver->getCurrentStepLinkForProject($project, $absolute);
    }

    public function getStatus(AbstractStep $step)
    {
        return $this->helper->getStatus($step);
    }
}
