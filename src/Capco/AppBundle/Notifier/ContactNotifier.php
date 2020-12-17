<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Mailer\Message\User\ContactMessage;
use Capco\UserBundle\Entity\User;

final class ContactNotifier extends BaseNotifier
{
    public function onContact(
        string $recipientEmail,
        string $senderEmail,
        string $senderName,
        string $message,
        string $object,
        string $title
    ) {
        $message = [
            'object' => $object,
            'title' => $title,
            'message' => $message,
        ];
        $params = [
            'senderName' => $senderName ? $senderName : 'Anonyme',
            'senderEmail' => $senderEmail,
        ];
        $recipient = new User();
        $recipient->setEmail($recipientEmail); //todo set locale
        $this->mailer->createAndSendMessage(
            ContactMessage::class,
            $message,
            $params,
            $recipient,
            null,
            $senderEmail
        );
    }
}
