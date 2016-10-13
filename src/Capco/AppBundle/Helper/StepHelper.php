<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;

class StepHelper
{
    protected $projectHelper;

    public function __construct(ProjectHelper $projectHelper)
    {
        $this->projectHelper = $projectHelper;
    }

    public function getStatus(AbstractStep $step)
    {
        $now = new \DateTime();

        if ($step->getStartAt()) {
            if ($step->getEndAt()) {
                if ($step->getStartAt() > $now) {
                    return 'future';
                }

                return $step->getEndAt() > $now ? 'open' : 'closed';
            }

            return $step->getStartAt() > $now ? 'future' : 'closed';
        }

        $previousSteps = $this->projectHelper->getPreviousSteps($step);

        foreach ($previousSteps as $previousStep) {
            if ($previousStep->getStartAt() > $now || $previousStep->getEndAt() > $now) {
                return 'future';
            }
        }

        return 'closed';
    }
}
