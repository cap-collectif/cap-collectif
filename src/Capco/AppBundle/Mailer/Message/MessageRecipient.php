<?php

namespace Capco\AppBundle\Mailer\Message;

class MessageRecipient
{
    private $emailAddress;
    private $locale;
    private $fullName;
    private $vars;

    public function __construct(
        string $emailAddress,
        ?string $locale = null,
        ?string $fullName = null,
        array $vars = []
    ) {
        $this->emailAddress = $emailAddress;
        $this->locale = $locale;
        $this->fullName = $fullName;
        $this->vars = $vars;
    }

    public function getEmailAddress(): string
    {
        return $this->emailAddress;
    }

    public function getLocale(): ?string
    {
        return $this->locale;
    }

    public function getFullName(): ?string
    {
        return $this->fullName;
    }

    public function getVars(): array
    {
        return $this->vars;
    }
}
