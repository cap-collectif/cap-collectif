<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Mailer\Message\AdminMessage;

final class EventCreateAdminMessage extends AdminMessage
{
    public static function create(
        Event $event,
        string $eventAdminUrl,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'event-needing-examination',
            static::getMySubjectVars($event->getTitle()),
            '@CapcoMail/notifyAdminOfNewEvent.html.twig',
            static::getMyTemplateVars($event, $eventAdminUrl)
        );

        return $message;
    }

    private static function getMyTemplateVars(Event $event, string $eventAdminUrl): array
    {
        return [
            'eventTitle' => self::escape($event->getTitle()),
            'eventAdminUrl' => $eventAdminUrl
        ];
    }

    private static function getMySubjectVars(string $eventTitle): array
    {
        return [
            '{eventTitle}' => self::escape($eventTitle)
        ];
    }
}
