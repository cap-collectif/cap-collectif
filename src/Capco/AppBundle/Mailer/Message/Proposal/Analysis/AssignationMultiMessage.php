<?php

namespace Capco\AppBundle\Mailer\Message\Proposal\Analysis;

use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

class AssignationMultiMessage extends AbstractExternalMessage
{
    final public const SUBJECT = 'notification.title.multiple.contribution.assigned';
    final public const TEMPLATE = '@CapcoMail/Proposal/notifyAnalyst.html.twig';
    final public const FOOTER = '';

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
