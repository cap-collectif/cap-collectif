<?php

namespace Capco\AppBundle\Mailer\Message;

use Capco\UserBundle\Entity\User;

class MagicLinkMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'magic-link-email-subject';
    public const TEMPLATE = '@CapcoMail/magicLinkMessage.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(User $user, array $params): array
    {
        return [
            'username' => $user->getUsername(),
            'magicLinkUrl' => $params['magicLinkUrl'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'variant' => $params['variant'],
        ];
    }

    public static function getMySubjectVars(User $user, array $params): array
    {
        return [
            'siteName' => $params['siteName'],
        ];
    }
}
