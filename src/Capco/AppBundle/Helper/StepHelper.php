<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Entity\Steps\AbstractStep;

class StepHelper
{
    public function getStatus(AbstractStep $step, ?\DateTime $now = null): string
    {
        if (null === $now) {
            $now = new \DateTime();
        }

        if ($step->isOpen($now)) {
            return 'open';
        }
        if ($step->isFuture($now)) {
            return 'future';
        }

        return 'closed';
    }
}
