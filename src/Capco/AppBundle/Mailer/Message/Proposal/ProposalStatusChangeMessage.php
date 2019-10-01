<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\SiteParameter\Resolver;

final class ProposalStatusChangeMessage extends ProposalMessage
{
    public static function create(
        Proposal $proposal,
        string $proposalUrl,
        string $baseUrl,
        string $siteName,
        string $siteUrl,
        Resolver $siteParameter
    ): self {
        return new self(
            $proposal->getAuthor()->getEmail(),
            $proposal->getAuthor()->getDisplayName(),
            'proposal-notifier-new-status',
            static::getMySubjectVars($proposal),
            '@CapcoMail/Proposal/notifyProposalAuthorStatusChange.html.twig',
            static::getMyTemplateVars(
                $proposal,
                $baseUrl,
                $siteName,
                $siteUrl,
                '@CapcoMail/Proposal/titleLayout.html.twig',
                $siteParameter,
                $proposalUrl
            )
        );
    }

    protected static function getMySubjectVars(Proposal $proposal): array
    {
        return [
            '{proposalTitle}' => self::escape($proposal->getTitle()),
            '{proposalStatus}' => $proposal->getStatus()
                ? self::escape($proposal->getStatus()->getName())
                : ''
        ];
    }
}
