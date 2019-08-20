<?php

namespace Capco\AppBundle\Mailer\Message;

use Capco\AppBundle\Entity\Event;

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
            static::getMyTemplateVars(
                $event->getAuthor()->getUsername(),
                $event->getCreatedAt()->format('d/m/Y'),
                $event->getCreatedAt()->format('H:i:s'),
                $event->getBodyTextExcerpt(),
                $eventAdminUrl
            )
        );

        return $message;
    }

    private static function getMyTemplateVars(
        string $authorName,
        string $date,
        string $time,
        string $event,
        string $eventAdminUrl,
        string $eventTitle
    ): array {
        return [
            '%username%' => self::escape($authorName),
            '%eventTitle%' => self::escape($eventTitle),
            '%date%' => $date,
            '%time%' => $time,
            '%event%' => self::escape($event),
            'eventAdminUrl' => $eventAdminUrl,
        ];
    }

    private static function getMySubjectVars(string $eventTitle): array
    {
        return [
            '{eventTitle}' => self::escape($eventTitle),
        ];
    }
}
