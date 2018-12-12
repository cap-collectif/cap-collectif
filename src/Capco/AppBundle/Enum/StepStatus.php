<?php

namespace Capco\AppBundle\Enum;

use Capco\AppBundle\Entity\Steps\AbstractStep;

final class StepStatus
{
    public const FUTURE = AbstractStep::OPENING_STATUS_FUTURE;
    public const OPENED = AbstractStep::OPENING_STATUS_OPENED;
    public const CLOSED = AbstractStep::OPENING_STATUS_CLOSED;
}
