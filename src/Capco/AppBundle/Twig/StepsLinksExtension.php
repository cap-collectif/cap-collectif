<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\StepResolver;

class StepsLinksExtension extends \Twig_Extension
{
    protected $resolver;

    public function __construct(StepResolver $resolver)
    {
        $this->resolver = $resolver;
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
        return array(
            new \Twig_SimpleFilter('capco_step_link', array($this, 'getStepLink')),
            new \Twig_SimpleFilter('capco_first_step_link', array($this, 'getFirstStepLink')),
            new \Twig_SimpleFilter('capco_current_step_link', array($this, 'getCurrentStepLink')),
        );
    }

    public function getStepLink($step, $absolute = false)
    {
        return $this->resolver->getLink($step, $absolute);
    }

    public function getFirstStepLink($consultation, $absolute = false)
    {
        return $this->resolver->getFirstStepLinkForConsultation($consultation, $absolute);
    }

    public function getCurrentStepLink($consultation, $absolute = false)
    {
        return $this->resolver->getCurrentStepLinkForConsultation($consultation, $absolute);
    }
}
