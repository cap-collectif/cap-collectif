<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Entity\Steps\AbstractStep;

class StepHelper
{
    public function getStatus(AbstractStep $step)
    {
        $now = new \DateTime();

        if (null !== $step->getStartAt() && $step->getStartAt() > $now) {
            return 'future';
        }

        if (null !== $step->getStartAt() && null === $step->getEndAt() && $step->getStartAt() < $now) {
            return 'open';
        }

        if (null === $step->getEndAt() && null === $step->getStartAt()) {
            return 'open';
        }

        if (null === $step->getStartAt() && $step->getEndAt() > $now) {
            return 'open';
        }

        if ($step->getStartAt() && $step->getStartAt() < $now && $step->getEndAt() > $now) {
            return 'open';
        }

        return 'closed';
    }
}
