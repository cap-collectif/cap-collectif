<?php

namespace Capco\AppBundle\Mailer\Message;

class ExternalMessage extends Message
{
    public function getFooterTemplate(): string
    {
        return 'notification.email.external_footer';
    }

    public function getFooterVars(): array
    {
        return [
            '{to}' => $this->getRecipient(0) ? self::escape($this->getRecipient(0)->getEmailAddress()) : '',
            '{sitename}' => $this->getSitename(),
            '{siteUrl}' => $this->getSiteUrl(),
            '{businessUrl}' => 'https://cap-collectif.com',
            '{business}' => 'Cap Collectif',
        ];
    }
}
