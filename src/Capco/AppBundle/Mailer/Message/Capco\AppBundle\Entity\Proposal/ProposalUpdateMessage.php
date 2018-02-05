<?php

namespace Capco\AppBundle\Mailer\Message\Capco\AppBundle\Entity\Proposal;

use Capco\AppBundle\Mailer\Message\AdminMessage;
use Capco\AppBundle\Entity\Capco\AppBundle\Entity\Proposal;

final class ProposalUpdateMessage extends AdminMessage
{
    public static function create(
        string $recipentEmail,
        string $recipientName = null
    ): self
    {
        return new self(
            $recipentEmail,
            $recipientName,
            'email-subject-test',
            static::getMySubjectVars(),
            'email-content-test',
            static::getMyTemplateVars()
        );
    }

    private static function getMyTemplateVars(
        $username,
        $usernameUrl
    ): array
    {
        return [
            '{username}' => $username,
            '{usernameUrl}' => $usernameUrl
        ];
    }

    private static function getMySubjectVars(
        $username
    ): array
    {
        return [
            '{username}' => $username
        ];
    }
}
