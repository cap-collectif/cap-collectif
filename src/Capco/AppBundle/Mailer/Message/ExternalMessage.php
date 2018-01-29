<?php

namespace Capco\AppBundle\Mailer\Message;

class ExternalMessage extends Message
{
    protected $sitename;

    public function getFooterTemplate(): string
    {
        return 'notification.email.external_footer';
    }

    public function getFooterVars(): array
    {
        return [
            '%to%' => $this->getRecipient(0) ? self::escape($this->getRecipient(0)->getEmailAddress()) : '',
            '%sitename%' => $this->getSitename() ? self::escape($this->getSitename()) : 'Cap Collectif',
        ];
    }

    public function setSitename(string $value): self
    {
        $this->sitename = $value;

        return $this;
    }

    public function getSitename()//:?string
    {
        return $this->sitename;
    }
}
