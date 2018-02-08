<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\ExternalMessage;

final class ProposalStatusChangeInCollectMessage extends ExternalMessage
{
    public static function create(
        Proposal $proposal,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'proposal_status_change_collect.notification.subject',
            static::getMySubjectVars(),
            '@CapcoMail/notifyProposalStatusChange.html.twig',
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
        $proposal
    ): array {
        return [
            'proposal' => $proposal,
        ];
    }
}
