<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Mailer\Message\Event\EventMessage as EventAdminMessage;

final class EventCreateAdminMessage extends EventAdminMessage
{
    public static function create(
        Event $event,
        string $eventAdminUrl,
        string $recipentEmail,
        string $baseUrl,
        string $siteName,
        string $siteUrl,
        string $recipientName = null
    ): self {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'event-needing-examination',
            static::getMySubjectVars($event->getTitle()),
            '@CapcoMail/Admin/notifyAdminOfNewEvent.html.twig',
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
