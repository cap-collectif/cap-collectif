<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class ProposalNewsDeleteAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'notification.proposal_activity.delete.subject';
    public const TEMPLATE = '@CapcoMail/Proposal/notifyProposalNewsAdmin.html.twig';

    public static function getMyTemplateVars($element, array $params): array
    {
        return [
            'postAuthor' => self::escape($params['postAuthor']),
            'proposalName' => self::escape($params['proposalName']),
            'projectName' => self::escape($params['projectName']),
            'bodyTrad' => 'notification.proposal_activity.delete.body',
            'titleTrad' => 'notification.proposal_activity.delete.subject',
            'postURL' => null,
        ];
    }

    public static function getMySubjectVars($element, array $params): array
    {
        return [
            'project' => self::escape($params['projectName']),
        ];
    }
}
