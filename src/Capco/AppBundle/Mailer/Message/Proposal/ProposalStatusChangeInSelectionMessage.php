<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Mailer\Message\ExternalMessage;

final class ProposalStatusChangeInSelectionMessage extends ExternalMessage
{
    public static function create(
        Selection $selection,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'proposal_status_change_collect.notification.subject',
            static::getMySubjectVars(),
            '@CapcoMail/notifyProposalStatusChangeInSelection.html.twig',
            static::getMyTemplateVars(
                $selection
            )
        );
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }

    private static function getMyTemplateVars(
        Selection $selection
    ): array {
        return [
            'selection' => $selection,
        ];
    }
}
