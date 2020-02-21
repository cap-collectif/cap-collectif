<?php

namespace Capco\AppBundle\Mailer\Message;

use Capco\UserBundle\Entity\User;

abstract class AbstractAdminMessage extends AbstractMessage
{
    public const FOOTER = 'notification.email.admin_footer';

    public function __construct(
        string $recipientEmail,
        string $subject,
        array $subjectVars,
        string $template, // twig or trad key
        array $templateVars
    ) {
        parent::__construct(
            $recipientEmail,
            null, //default locale
            null, //no name for admin
            $subject,
            $subjectVars,
            $template,
            $templateVars
        );
    }

    public static function getMyFooterVars(
        string $recipientEmail = '',
        string $siteName = '',
        string $siteURL = ''
    ): array {
        return [
            '%to%' => $recipientEmail,
            '%sitename%' => $siteName,
            '%siteUrl%' => $siteURL
        ];
    }
}
