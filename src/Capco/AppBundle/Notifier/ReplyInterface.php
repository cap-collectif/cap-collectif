<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\UserBundle\Entity\User;

interface ReplyInterface
{
    public function acknowledgeReply(
        Project $project,
        Reply $reply,
        ?\DateTime $endAt,
        string $stepUrl,
        AbstractStep $step,
        User $user,
        bool $isUpdated = false
    ): void;
}
