<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;

final class ProposalStatusChangeMessage extends ProposalMessage
{
    public static function create(
        Proposal $proposal,
        string $proposalUrl,
        $baseUrl,
        $siteName,
        $siteUrl
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
                $proposalUrl
            )
        );
    }

    protected static function getMySubjectVars(Proposal $proposal): array
    {
        return [
            '{propositionName}' => $proposal->getTitle(),
            '{stepName}' => $proposal->getStep() ? $proposal->getStep()->getTitle() : ''
        ];
    }
}
