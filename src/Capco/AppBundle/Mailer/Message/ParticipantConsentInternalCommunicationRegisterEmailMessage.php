<?php

namespace Capco\AppBundle\Mailer\Message;

class ParticipantConsentInternalCommunicationRegisterEmailMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'participation-workflow.create-account-helptext';
    public const TEMPLATE = '@CapcoMail/participant_consent_internal_communication_register_email.html.twig';
    public const FOOTER = '';

    /**
     * @param mixed[] $params
     *
     * @return array{redirectUrl: string, baseUrl: string, siteName: string}
     */
    public static function getMyTemplateVars(mixed $element, array $params): array
    {
        return [
            'redirectUrl' => $params['redirectUrl'],
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
            'siteName' => $params['siteName'] . ' - ',
        ];
    }
}
