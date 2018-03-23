<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\Message;

final class ProposalAknowledgeMessage extends Message
{
    public static function create(
        Proposal $proposal,
        string $recipentEmail,
        string $stepLink,
        string $proposalLink,
        string $homepageUrl,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'acknowledgment-of-receipt',
            static::getMySubjectVars(),
            '@CapcoMail/aknowledgeProposal.html.twig',
            static::getMyTemplateVars(
                $proposal,
                $recipentEmail,
                $stepLink,
                $proposalLink,
                $homepageUrl
            )
        );
    }

    public function getFooterTemplate()
    {
    }

    public function getFooterVars()
    {
    }

    private static function getMyTemplateVars(
        Proposal $proposal,
        string $recipentEmail,
        string $stepLink,
        string $proposalLink,
        string $homepageUrl
    ): array {
        return [
            'projectTitle' => self::escape($proposal->getStep()->getProject()->getTitle()),
            'projectLink' => $stepLink,
            'proposalLink' => $proposalLink,
            'proposalName' => $proposal->getTitle(),
            'homepageUrl' => $homepageUrl,
            'sendAt' => $proposal->getCreatedAt(),
            'endAt' => $proposal->getStep()->getEndAt(),
            'to' => self::escape($recipentEmail),
            'username' => $proposal->getAuthor()->getDisplayName(),
            'timezone' => $proposal->getCreatedAt()->getTimezone(),
            'business' => 'Cap Collectif',
            'businessUrl' => 'https://cap-collectif.com/',
        ];
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }
}
