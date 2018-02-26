<?php

namespace Capco\AppBundle\Mailer\Message;

class ExternalContactMessage extends Message
{
    public function getFooterTemplate(): string
    {
        return 'email-footer-external-contact';
    }

    public function getFooterVars(): array
    {
        return [
            '{sitename}' => $this->getSitename(),
            '{siteUrl}' => $this->getSiteUrl(),
        ];
    }
}
