<?php

namespace Capco\AppBundle\Mailer\Message\Proposal\Analysis;

use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

class AssignationMultiMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'notification.title.multiple.assigned';
    public const TEMPLATE = '@CapcoMail/Proposal/notifyAnalyst.html.twig';
    public const FOOTER = '';

    public static function getMySubjectVars(array $proposals, array $params): array
    {
        return [
            'count' => \count($proposals),
            'role' => $params['role'],
        ];
    }

    public static function getMyTemplateVars(array $proposals, array $params): array
    {
        return [
            'siteName' => $params['siteName'],
            'projectName' => $params['projectName'],
            'count' => \count($proposals),
            'proposals' => $proposals,
            'evaluationsUrl' => $params['evaluationsUrl'],
            'role' => $params['role'],
            'baseUrl' => $params['baseURL'],
            'siteUrl' => $params['baseURL'],
            'assignation' => true,
        ];
    }
}
