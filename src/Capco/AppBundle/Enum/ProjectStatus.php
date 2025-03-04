<?php

namespace Capco\AppBundle\Enum;

use Capco\AppBundle\Entity\Project;

final class ProjectStatus
{
    public const FUTURE_WITHOUT_FINISHED_STEPS = Project::STATE_FUTURE_WITHOUT_FINISHED_STEPS;
    public const OPENED_PARTICIPATION = Project::STATE_OPENED_PARTICIPATION;
    public const OPENED = Project::STATE_OPENED;
    public const CLOSED = Project::STATE_CLOSED;
    public const FUTURE_WITH_FINISHED_STEPS = Project::STATE_FUTURE_WITH_FINISHED_STEPS;
    public const UNKNOWN = Project::STATE_UNKNOWN;
}
