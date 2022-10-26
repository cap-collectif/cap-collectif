<?php

namespace Capco\AppBundle\Mailer\Message\Proposal\Analysis;

use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

class UnassignationMultiMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'notification.title.multiple.contribution.unassigned';
    public const TEMPLATE = '@CapcoMail/Proposal/notifyAnalyst.html.twig';
    public const FOOTER = '';

    public static function getMySubjectVars(array $proposals, array $params): array
    {
        return [
            'count' => \count($proposals),
        ];
    }

    public static function getMyTemplateVars(array $proposals, array $params): array
    {
        return [
            'siteName' => $params['siteName'],
            'projectName' => $proposals[0]->getProject()->getTitle(),
            'proposals' => $proposals,
            'proposalName' => $proposals[0]->getTitle(),
            'baseUrl' => $params['baseURL'],
            'siteUrl' => $params['baseURL'],
            'assignation' => false,
        ];
    }
}
