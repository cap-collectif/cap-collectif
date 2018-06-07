<?php

namespace Capco\AppBundle\Mailer\Message;

class DefaultMessage extends Message
{
    public function getFooterTemplate(): ?string
    {
        return null;
    }

    public function getFooterVars(): ?array
    {
        return null;
    }
}
