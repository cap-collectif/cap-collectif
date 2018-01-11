<?php

namespace Capco\AppBundle\Mailer\Message;

class MessageRecipient
{
    private $emailAddress;
    private $fullName;
    private $vars;

    public function __construct(string $emailAddress, string $fullName = null, array $vars = [])
    {
        $this->emailAddress = $emailAddress;
        $this->fullName = $fullName;
        $this->vars = $vars;
    }

    public function getEmailAddress(): string
    {
        return $this->emailAddress;
    }

<<<<<<< HEAD
    public function getFullName()//: ?string
=======
    public function getFullName(): ?string
>>>>>>> Add structure for emailing
    {
        return $this->fullName;
    }

    public function getVars(): array
    {
        return $this->vars;
    }
}
