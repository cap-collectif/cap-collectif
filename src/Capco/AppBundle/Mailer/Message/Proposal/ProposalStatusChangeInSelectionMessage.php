<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class ProposalStatusChangeInSelectionMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'contribution_status_change_collect.notification.subject';
    public const TEMPLATE = '@CapcoMail/notifyProposalStatusChangeInSelection.html.twig';

    public static function getMySubjectVars(Selection $selection, array $params): array
    {
        return [];
    }

    public static function getMyTemplateVars(Selection $selection, array $params): array
    {
        return [
            'selection' => $selection,
        ];
    }
}
