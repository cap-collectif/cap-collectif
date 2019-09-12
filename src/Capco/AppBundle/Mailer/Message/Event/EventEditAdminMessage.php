<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\Entity\Event;

final class EventEditAdminMessage extends EventMessage
{
    public static function create(
        Event $event,
        string $eventAdminUrl = null,
        string $recipentEmail,
        string $baseUrl,
        string $siteName,
        string $siteUrl,
        string $recipientName = null
    ): self {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'event-awaiting-publication',
            static::getMySubjectVars($event->getTitle()),
            '@CapcoMail/Admin/notifyAdminOfEditedEvent.html.twig',
            static::getMyTemplateVars(
                $event,
                $baseUrl,
                $siteName,
                $siteUrl,
                $recipientName,
                $eventAdminUrl
            )
        );

        return $message;
    }
}
