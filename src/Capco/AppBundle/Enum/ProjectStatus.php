<?php

namespace Capco\AppBundle\Enum;

use Capco\AppBundle\Entity\Project;

final class ProjectStatus
{
    public const FUTURE_WITHOUT_FINISHED_STEPS = Project::OPENING_STATUS_FUTURE_WITHOUT_FINISHED_STEPS;
    public const OPENED = Project::OPENING_STATUS_OPENED;
    public const CLOSED = Project::OPENING_STATUS_CLOSED;
    public const FUTURE_WITH_FINISHED_STEPS = Project::OPENING_STATUS_FUTURE_WITH_FINISHED_STEPS;
}
