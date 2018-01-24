<?php

namespace Capco\AppBundle\Mailer\Message\Proposal\Admin;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AdminMessage;

final class ProposalUpdateMessage extends AdminMessage
{
    public static function create(Proposal $proposal, string $recipentEmail, string $recipientName, string $proposalUrl, string $proposalAdminUrl, string $authorUrl, string $sitename): self
    {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'notification.email.proposal.edit.subject',
            static::getMySubjectVars(
                $sitename,
                $proposal->getAuthor()->getDisplayName(),
                $proposal->getProposalForm()->getStep()->getProject()->getTitle()
            ),
            'notification.email.proposal.edit.body',
            static::getMyTemplateVars(
                $authorUrl,
                $proposal->getAuthor()->getDisplayName(),
                $proposal->getTitle(),
                $proposal->getCreatedAt()->format('d/m/Y'),
                $proposal->getCreatedAt()->format('H:i:s'),
                $proposal->getBodyExcerpt(),
                $proposalUrl,
                $proposalAdminUrl,
                $proposal->getProposalForm()->getStep()->getProject()->getTitle()
            )
        );

        $message->setSitename($sitename);
        $message->setSenderEmail('assistance@cap-collectif.com');
        // $message->setSenderName($senderName);

        return $message;
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
        string $sitename,
        string $username,
        string $project
    ): array {
        return [
          '%sitename%' => self::escape($sitename),
          '%username%' => self::escape($username),
          '%project%' => self::escape($project),
        ];
    }
}
