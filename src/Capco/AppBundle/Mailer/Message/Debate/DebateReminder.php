<?php

namespace Capco\AppBundle\Mailer\Message\Debate;

use Capco\AppBundle\Entity\Debate\DebateVoteToken;

class DebateReminder extends DebateLaunch
{
    final public const SUBJECT = 'email-debate-reminder-subject';

    public static function getMyTemplateVars(DebateVoteToken $voteToken, array $params): array
    {
        return self::filterParams($params) + [
            'username' => $voteToken->getUser()->getDisplayName(),
            'debate' => $voteToken->getDebate(),
            'isReminder' => true,
        ];
    }
}
