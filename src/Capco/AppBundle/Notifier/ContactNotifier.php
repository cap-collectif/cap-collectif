<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Mailer\Message\ContactMessage;

final class ContactNotifier extends BaseNotifier
{
    public function onContact(string $recipient, string $senderEmail, string $senderName, string $message)
    {
        $this->mailer->sendMessage(ContactMessage::create(
            $recipient,
            $senderEmail,
            $senderName,
            $message
        ));
    }
}
