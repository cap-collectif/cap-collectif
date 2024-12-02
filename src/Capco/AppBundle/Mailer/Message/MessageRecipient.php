<?php

namespace Capco\AppBundle\Mailer\Message;

class MessageRecipient
{
    public function __construct(private readonly string $emailAddress, private ?string $locale = null, private ?string $fullName = null, private array $vars = [])
    {
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
