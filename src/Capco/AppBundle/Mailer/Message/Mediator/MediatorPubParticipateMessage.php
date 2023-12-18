<?php

namespace Capco\AppBundle\Mailer\Message\Mediator;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

class MediatorPubParticipateMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'notification.pub.participation.subject';
    public const TEMPLATE = '@CapcoMail/Mediator/participationEmail.html.twig';

    public static function getMyTemplateVars(Mediator $mediator, array $params): array
    {
        return [
            'projectName' => $params['projectName'],
            'siteName' => $params['siteName'],
            'participationUrl' => $params['participationUrl'],
            'baseUrl' => $params['baseURL'],
        ];
    }

    public static function getMySubjectVars(Mediator $mediator, array $params): array
    {
        return [
            'projectName' => $params['projectName'],
            'siteName' => $params['siteName'],
        ];
    }
}
