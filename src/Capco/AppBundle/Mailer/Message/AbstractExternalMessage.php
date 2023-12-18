<?php

namespace Capco\AppBundle\Mailer\Message;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;

abstract class AbstractExternalMessage extends AbstractMessage
{
    public const FOOTER = 'notification.email.external_footer';

    public function __construct(
        string $recipientEmail,
        string $subject,
        array $subjectVars,
        string $template,
        array $templateVars,
        ContributorInterface $recipient,
        ?string $replyTo = null
    ) {
        parent::__construct(
            $recipientEmail,
            $recipient->getLocale(),
            $recipient->getShowName(),
            $subject,
            $subjectVars,
            $template,
            $templateVars,
            null,
            null,
            $replyTo
        );
    }

    public static function getMyFooterVars(
        string $recipientEmail = '',
        string $siteName = '',
        string $siteURL = ''
    ): array {
        return [
            '{to}' => $recipientEmail,
            '{sitename}' => $siteName,
            '{siteUrl}' => $siteURL,
            '{businessUrl}' => 'https://cap-collectif.com',
            '{business}' => 'Cap Collectif',
        ];
    }
}
