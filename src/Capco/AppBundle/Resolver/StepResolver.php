<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\AbstractStep;
use Symfony\Component\Routing\Router;

class StepResolver
{
    private $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function getLink(AbstractStep $step = null, $absolute = false)
    {
        if (null != $step) {
            if ($step->isConsultationStep()) {
                return $this->router->generate('app_consultation_show', array('consultationSlug' => $step->getConsultation()->getSlug(), 'stepSlug' => $step->getSlug()), $absolute);
            }
            if ($step->isPresentationStep()) {
                return $this->router->generate('app_consultation_show_presentation', array('consultationSlug' => $step->getConsultation()->getSlug(), 'stepSlug' => $step->getSlug()), $absolute);
            }
            if ($step->isOtherStep()) {
                return $this->router->generate('app_consultation_show_step', array('consultationSlug' => $step->getConsultation()->getSlug(), 'stepSlug' => $step->getSlug()), $absolute);
            }
        }

        return null;
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
