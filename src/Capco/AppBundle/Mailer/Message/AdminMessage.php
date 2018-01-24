<?php

namespace Capco\AppBundle\Mailer\Message;

class AdminMessage extends Message
{
    protected $sitename;

    public function getFooterTemplate(): string
    {
        return 'notification.email.admin_footer';
    }

    public function getFooterVars(): array
    {
        return [
            '%to%' => $this->getRecipient(0) ? self::escape($this->getRecipient(0)->getEmailAddress()) : '',
            '%sitename%' => $this->getSitename() ? self::escape($this->getSitename()) : 'Cap Collectif',
        ];
    }

    public function setSitename(string $value)
    {
        $this->sitename = $value;
    }

    public function getSitename()//:?string
    {
        return $this->sitename;
    }
}
