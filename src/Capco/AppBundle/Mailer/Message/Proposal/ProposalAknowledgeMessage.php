<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\ExternalMessage;

final class ProposalAknowledgeMessage extends ExternalMessage
{
    public static function create(
        Proposal $proposal,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'proposal_answer.notification.subject',
            static::getMySubjectVars(),
            '@CapcoMail/test.html.twig',
            static::getMyTemplateVars(
                $proposal
            )
        );
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }

    private static function getMyTemplateVars(
        Proposal $proposal
    ): array {
        return [
            'proposal' => $proposal,
        ];
    }
}
