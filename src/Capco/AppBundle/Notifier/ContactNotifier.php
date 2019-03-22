<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Mailer\Message\User\ContactMessage;

final class ContactNotifier extends BaseNotifier
{
    public function onContact(
        string $recipient,
        string $senderEmail,
        string $senderName,
        string $message,
        string $siteUrl,
        string $object,
        string $title
    ) {
        $this->mailer->sendMessage(
            ContactMessage::create(
                $recipient,
                $senderEmail,
                $senderName,
                $message,
                $this->siteParams->getValue('global.site.fullname'),
                $siteUrl,
                null,
                $object,
                $title
            )
        );
    }
}
