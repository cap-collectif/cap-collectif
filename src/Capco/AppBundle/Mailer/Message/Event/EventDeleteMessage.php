<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\Entity\Event;

final class EventDeleteMessage extends EventMessage
{
    public static function create(
        Event $event,
        string $recipentEmail,
        string $baseUrl,
        string $siteName,
        string $siteUrl,
        string $recipientName = null,
        string $eventUrl = null
    ): self {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'event-canceled-notification',
            static::getMySubjectVars($event->getTitle()),
            '@CapcoMail//notifyParticipantOfDeletedEvent.html.twig',
            static::getMyTemplateVars($event, $baseUrl, $siteName, $siteUrl, $recipientName)
        );

        return $message;
    }
}
