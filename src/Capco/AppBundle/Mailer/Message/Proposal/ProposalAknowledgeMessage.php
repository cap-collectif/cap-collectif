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
            '@CapcoMail/aknowledgeProposal.html.twig',
            static::getMyTemplateVars(
                $proposal,
                $recipentEmail
            )
        );
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }

    private static function getMyTemplateVars(
        Proposal $proposal,
        string $recipentEmail
    ): array {
        return [
            '{proposal}' => $proposal,
            '{sendAt}' => $proposal->getCreatedAt(),
            '{username}' => $proposal->getAuthor()->getDisplayName(),
            '{timezone}' => $proposal->getCreatedAt()->getTimezone(),
            '{to}' => self::escape($recipentEmail),
            '{business}' => 'Cap Collectif',
            '{businessUrl}' => 'https://cap-collectif.com/',
        ];
    }
}
