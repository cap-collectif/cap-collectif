<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class ProposalDeleteAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'notification.contribution.delete.subject';
    public const TEMPLATE = 'notification.contribution.delete.body';

    public static function getMyTemplateVars(Proposal $proposal, array $params): array
    {
        return [
            'userUrl' => $params['authorURL'],
            'username' => self::escape($proposal->getAuthor()->getDisplayName()),
            'proposal' => self::escape($proposal->getTitle()),
            'date' => $proposal->getCreatedAt()->format('d/m/Y'),
            'time' => $proposal->getCreatedAt()->format('H:i:s'),
            'proposalExcerpt' => self::escape($proposal->getBodyTextExcerpt()),
            'proposalUrl' => $params['proposalURL'],
            'proposalUrlBack' => $params['adminURL'],
            'project' => self::escape(
                $proposal
                    ->getProposalForm()
                    ->getStep()
                    ->getProject()
                    ->getTitle()
            ),
        ];
    }

    public static function getMySubjectVars(Proposal $proposal, array $params): array
    {
        return [
            'username' => self::escape($proposal->getAuthor()->getDisplayName()),
            'project' => self::escape(
                $proposal
                    ->getProposalForm()
                    ->getStep()
                    ->getProject()
                    ->getTitle()
            ),
        ];
    }
}
