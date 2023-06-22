<?php

namespace Capco\AppBundle\Mailer\Message;

abstract class AbstractModeratorMessage extends AbstractAdminMessage
{
    public const FOOTER = 'notification.email.moderator_footer';

    protected $moderationLinks = [];

    public function __construct(
        string $recipientEmail,
        string $subject,
        array $subjectVars,
        string $template,
        array $templateVars
    ) {
        parent::__construct($recipientEmail, $subject, $subjectVars, $template, $templateVars);
    }

    public function setModerationLinks(array $moderationLinks): self
    {
        $this->moderationLinks = $moderationLinks;

        return $this;
    }

    public function getTemplateVars(): array
    {
        return array_merge($this->templateVars, $this->moderationLinks);
    }

    public static function getMyFooterVars(
        string $recipientEmail = '',
        string $siteName = '',
        string $siteURL = ''
    ): array {
        return [
            '{to}' => $recipientEmail,
            '{sitename}' => $siteName,
            '{business}' => 'Cap Collectif',
            '{businessUrl}' => 'https://cap-collectif.com/',
            '{siteUrl}' => $siteURL,
        ];
    }
}
