<?php

namespace Capco\AppBundle\Event;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Symfony\Contracts\EventDispatcher\Event;

class StepSavedEvent extends Event
{
    public const NAME = 'step.saved';

    private AbstractStep $step;

    public function __construct(AbstractStep $step)
    {
        $this->step = $step;
    }

    public function getStep(): AbstractStep
    {
        return $this->step;
    }
}
