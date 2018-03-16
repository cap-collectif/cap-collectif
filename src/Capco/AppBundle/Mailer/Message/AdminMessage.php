<?php

namespace Capco\AppBundle\Mailer\Message;

class AdminMessage extends Message
{
    public function getFooterTemplate(): string
    {
        return 'notification.email.admin_footer';
    }

    public function getFooterVars(): array
    {
        return [
            '%to%' => $this->getRecipient(0) ? self::escape($this->getRecipient(0)->getEmailAddress()) : '',
            '%sitename%' => $this->getSitename(),
            '%siteUrl%' => $this->getSiteUrl(),
        ];
    }
}
