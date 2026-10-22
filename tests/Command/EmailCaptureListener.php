<?php

namespace Capco\Tests\Command;

use Symfony\Component\Mailer\Event\MessageEvent;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

final class EmailCaptureListener
{
    /** @var list<Email> */
    public array $messages = [];

    public function onMessage(MessageEvent $event): void
    {
        $message = $event->getMessage();
        if (!$message instanceof Email) {
            throw new \RuntimeException('Expected an email message.');
        }

        $this->messages[] = clone $message;
    }

    public function getMessageForRecipient(string $recipient): Email
    {
        foreach ($this->messages as $message) {
            $recipients = array_map(static fn (Address $address): string => $address->getAddress(), $message->getTo());
            if (\in_array($recipient, $recipients, true)) {
                return $message;
            }
        }

        throw new \RuntimeException(sprintf('No email was captured for %s.', $recipient));
    }

    public function getMessageWithSubject(string $subject): Email
    {
        foreach ($this->messages as $message) {
            if (str_contains((string) $message->getSubject(), $subject)) {
                return $message;
            }
        }

        throw new \RuntimeException(sprintf('No email was captured with subject %s.', $subject));
    }
}
