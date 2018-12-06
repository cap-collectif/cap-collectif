<?php

namespace Capco\AppBundle\Enum;

use Capco\AppBundle\Entity\Project;

final class ProjectStatus
{
    public const FUTURE = Project::OPENING_STATUS_FUTURE;
    public const OPENED = Project::OPENING_STATUS_OPENED;
    public const ENDED = Project::OPENING_STATUS_ENDED;
}
