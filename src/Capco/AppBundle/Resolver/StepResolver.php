<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\AbstractStep;
use Capco\AppBundle\Resolver\UrlResolver;

class StepResolver
{
    private $urlResolver;

    public function __construct(UrlResolver $urlResolver)
    {
        $this->urlResolver = $urlResolver;
    }

    public function getLink(AbstractStep $step = null, $absolute = false)
    {
        return $this->urlResolver->getObjectUrl($step, $absolute);
    }

    public function getFirstStepLinkForConsultation(Consultation $consultation, $absolute = false)
    {
        return $this->getLink($consultation->getFirstStep(), $absolute);
    }

    public function getCurrentStepLinkForConsultation(Consultation $consultation, $absolute = false)
    {
        return $this->getLink($consultation->getCurrentStep(), $absolute);
    }
}
