<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class ProposalCreateAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'notification.proposal.create.subject';
    public const TEMPLATE = 'notification.proposal.create.body';

    public static function getMyTemplateVars(Proposal $proposal, array $params): array
    {
        return [
            'userUrl' => $params['authorURL'],
            'username' => self::escape($proposal->getAuthor()->getDisplayName()),
            'proposal' => self::escape($proposal->getTitle()),
            'date' => $proposal->getPublishedAt()->format('d/m/Y'),
            'time' => $proposal->getPublishedAt()->format('H:i:s'),
            'proposalSummary' => $params['proposalSummary'],
            'proposalDescription' => $proposal->getBodyTextExcerpt(140),
            'proposalUrl' => $params['proposalURL'],
            'proposalUrlBack' => $params['adminURL'],
            'project' => self::escape(
                $proposal->getProposalForm()->getStep()->getProject()->getTitle())
        ];
    }

    public static function getMySubjectVars(Proposal $proposal, array $params): array
    {
        return [
            'username' => self::escape($proposal->getAuthor()->getDisplayName()),
            'project' => self::escape(
                $proposal->getProposalForm()->getStep()->getProject()->getTitle()
            )
        ];
    }
}
