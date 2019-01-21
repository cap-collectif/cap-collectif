<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AdminMessage;

final class ProposalUpdateAdminMessage extends AdminMessage
{
    public static function create(Proposal $proposal,
                                  string $recipentEmail,
                                  string $proposalUrl,
                                  string $proposalAdminUrl,
                                  string $authorUrl,
                                  string $recipientName = null): self
    {
        return new self(
            $recipentEmail,
            $recipientName,
            'notification.email.proposal.update.subject',
            static::getMySubjectVars(
                $proposal->getAuthor()->getDisplayName(),
                $proposal->getProposalForm()->getStep()->getProject()->getTitle()
            ),
            'notification.email.proposal.update.body',
            static::getMyTemplateVars(
                $authorUrl,
                $proposal->getAuthor()->getDisplayName(),
                $proposal->getTitle(),
                $proposal->getUpdatedAt()->format('d/m/Y'),
                $proposal->getUpdatedAt()->format('H:i:s'),
                $proposal->getBodyTextExcerpt(),
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
        $proposalExcerpt,
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
            '%proposalExcerpt%' => self::escape($proposalExcerpt),
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
