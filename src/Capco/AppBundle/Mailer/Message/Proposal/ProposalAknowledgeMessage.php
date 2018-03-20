<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\Message;

final class ProposalAknowledgeMessage extends Message
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

    public function getFooterTemplate()
    {
    }

    public function getFooterVars()
    {
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
            'projectTitle' => self::escape($proposal->getStep()->getProject()->getTitle()),
            'projectLink' => '#',
            'sendAt' => $proposal->getCreatedAt(),
            'username' => $proposal->getAuthor()->getDisplayName(),
            'timezone' => $proposal->getCreatedAt()->getTimezone(),
            'business' => 'Cap Collectif',
            'businessUrl' => 'https://cap-collectif.com/',
        ];
    }
}
