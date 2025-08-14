<?php

namespace Capco\AppBundle\Mailer\Message;

class ParticipantConsentInternalCommunicationEmailMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'platform-please-confirm-email';
    public const TEMPLATE = '@CapcoMail/participant_consent_internal_communication_email.html.twig';
    public const FOOTER = '';

    /**
     * @param mixed[] $params
     *
     * @return array{confirmationUrl: string, baseUrl: string, siteName: string}
     */
    public static function getMyTemplateVars(mixed $element, array $params): array
    {
        return [
            'confirmationUrl' => $params['confirmationUrl'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
        ];
    }

    /**
     * @param mixed[] $params
     *
     * @return array{'siteName': string}
     */
    public static function getMySubjectVars(mixed $element, array $params): array
    {
        return [
            'siteName' => $params['siteName'],
        ];
    }
}
