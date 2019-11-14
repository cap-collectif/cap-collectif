<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\Entity\Event;

final class EventDeleteAdminMessage extends EventMessage
{
    public static function create(
        Event $event,
        string $recipentEmail,
        string $baseUrl,
        string $siteName,
        string $siteUrl,
        string $recipientName = null
    ): self {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'event-deleted-notification',
            static::getMySubjectVars($event->getTitle()),
            '@CapcoMail/Admin/notifyAdminOfDeletedEvent.html.twig',
            static::getMyTemplateVars($event, $baseUrl, $siteName, $siteUrl, $recipientName)
        );

        return $message;
    }
}
