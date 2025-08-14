<?php

namespace Capco\AppBundle\Mailer\Message\Participant;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

class ParticipantConfirmEmailMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'notification.comment.confirm_anonymous_email.subject';
    public const TEMPLATE = '@CapcoMail/Participant/participantConfirmationMessage.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(Participant $participant, array $params): array
    {
        return [
            'confirmationURL' => $params['confirmationURL'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
        ];
    }

    public static function getMySubjectVars(Participant $participant, array $params): array
    {
        return [];
    }
}
