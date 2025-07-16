<?php

namespace Capco\AppBundle\Message;

class MailSingleRecipientMessage
{
    public function __construct(
        private readonly string $senderEmail,
        private readonly string $recipientEmail,
        private readonly string $subject,
        private readonly string $htmlContent,
    ) {
    }

    public function getSenderEmail(): string
    {
        return $this->senderEmail;
    }

    public function getRecipientEmail(): string
    {
        return $this->recipientEmail;
    }

    public function getHtmlContent(): string
    {
        return $this->htmlContent;
    }

    public function getSubject(): string
    {
        return $this->subject;
    }
}
