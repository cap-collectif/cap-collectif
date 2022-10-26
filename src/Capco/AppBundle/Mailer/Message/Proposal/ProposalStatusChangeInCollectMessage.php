<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class ProposalStatusChangeInCollectMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'contribution_status_change_collect.notification.subject';
    public const TEMPLATE = '@CapcoMail/notifyProposalStatusChange.html.twig';

    public static function getMySubjectVars(Proposal $proposal, array $params): array
    {
        return [];
    }

    public static function getMyTemplateVars(Proposal $proposal, array $params): array
    {
        return [
            'proposal' => $proposal,
        ];
    }
}
