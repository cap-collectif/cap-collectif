<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AdminMessage;

final class ProposalCreateAdminMessage extends AdminMessage
{
    public static function create(Proposal $proposal,
                                  string $proposalSummary,
                                  string $recipentEmail,
                                  string $proposalUrl,
                                  string $proposalAdminUrl,
                                  string $authorUrl,
                                  string $recipientName = null): self
    {
        return new self(
            $recipentEmail,
            $recipientName,
            'notification.email.proposal.create.subject',
            static::getMySubjectVars(
                $proposal->getAuthor()->getDisplayName(),
                $proposal->getProposalForm()->getStep()->getProject()->getTitle()
            ),
            'notification.email.proposal.create.body',
            static::getMyTemplateVars(
                $authorUrl,
                $proposal->getAuthor()->getDisplayName(),
                $proposal->getTitle(),
                $proposal->getCreatedAt()->format('d/m/Y'),
                $proposal->getCreatedAt()->format('H:i:s'),
                $proposalSummary,
                $proposal->getBodyTextExcerpt(140),
                $proposalUrl,
                $proposalAdminUrl,
                $proposal->getProposalForm()->getStep()->getProject()->getTitle()
            )
        );
    }

    private static function getMyTemplateVars(
        string $authorUrl,
        string $authorName,
        string $proposalTitle,
        string $date,
        string $time,
        string $proposalSummary,
        string $proposalDescription,
        string $proposalUrl,
        string $proposalAdminUrl,
        string $projectTitle
    ): array {
        return [
            '%userUrl%' => $authorUrl,
            '%username%' => self::escape($authorName),
            '%proposal%' => self::escape($proposalTitle),
            '%date%' => $date,
            '%time%' => $time,
            '%proposalSummary%' => $proposalSummary,
            '%proposalDescription%' => $proposalDescription,
            '%proposalUrl%' => $proposalUrl,
            '%proposalUrlBack%' => $proposalAdminUrl,
            '%project%' => self::escape($projectTitle),
        ];
    }

    private static function getMySubjectVars(
        string $username,
        string $project
    ): array {
        return [
            '%username%' => self::escape($username),
            '%project%' => self::escape($project),
        ];
    }
}
