<?php

namespace Capco\AppBundle\Manager;


use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Step;
use Symfony\Component\Routing\Router;

class StepResolver
{
    private $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function getLink(Step $step)
    {
        if (null != $step) {
            if ($step->isConsultationStep()) {
                return $this->router->generate('app_consultation_show', array('slug'=>$step->getConsultation()->getSlug()));
            }
            else if ($step->isOtherStep()) {
                return $this->router->generate('app_consultation_show_step', array('consultation_slug'=>$step->getConsultation()->getSlug(), 'step_slug'=>$step->getSlug()));
            }
        }

        return null;

    }

    public function getFirstStepLinkForConsultation(Consultation $consultation)
    {
        return $this->getLink($consultation->getFirstStep());
    }


}
