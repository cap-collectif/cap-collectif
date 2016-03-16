<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\StepResolver;
use Capco\AppBundle\Helper\StepHelper;
use Capco\AppBundle\Entity\Steps\AbstractStep;

class StepsExtension extends \Twig_Extension
{
    protected $resolver;
    protected $helper;

    public function __construct(StepResolver $resolver, StepHelper $helper)
    {
        $this->resolver = $resolver;
        $this->helper = $helper;
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'capco_steps_links';
    }

    public function getFilters()
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
