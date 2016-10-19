<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Entity\Steps\AbstractStep;

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

        if ($step->getStartAt() && $step->getStartAt() > $now) {
            return 'future';
        }

        if ($step->getStartAt() && !$step->getEndAt() && $step->getStartAt() < $now) {
            return 'open';
        }

        if (!$step->getEndAt() && !$step->getStartAt()) {
            $previousSteps = $this->projectHelper->getPreviousSteps($step);

            foreach ($previousSteps as $previousStep) {
                if ($previousStep->getStartAt() > $now || $previousStep->getEndAt() > $now) {
                    return 'future';
                }
            }

            return 'open';
        }

        if (!$step->getStartAt() && $step->getEndAt() > $now) {
            return 'open';
        }

        if ($step->getStartAt() && $step->getStartAt() < $now && $step->getEndAt() > $now) {
            return 'open';
        }

        return 'closed';
    }
}
