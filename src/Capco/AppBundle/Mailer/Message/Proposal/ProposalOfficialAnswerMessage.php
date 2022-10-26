<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class ProposalOfficialAnswerMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'contribution_answer.notification.subject';
    public const TEMPLATE = '@CapcoMail/notifyProposalAnswer.html.twig';

    public static function getMySubjectVars(Proposal $proposal, array $params): array
    {
        return [];
    }

    public static function getMyTemplateVars(Proposal $proposal, array $params): array
    {
        return [
            'proposal' => $proposal,
            'post' => $params['post'],
        ];
    }
}
