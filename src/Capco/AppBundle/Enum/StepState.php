<?php

namespace Capco\AppBundle\Enum;

use Capco\AppBundle\Entity\Steps\AbstractStep;

final class StepState
{
    public const FUTURE = AbstractStep::STATE_FUTURE;
    public const OPENED = AbstractStep::STATE_OPENED;
    public const CLOSED = AbstractStep::STATE_CLOSED;
}
