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
            'notification.email.anonymous_event.create.subject',
            static::getMySubjectVars($event->getAuthor()->getDisplayName()),
            'notification.email.anonymous_event.create.body',
            static::getMyTemplateVars(
                $event->getAuthor()->getUsername(),
                $event->getCreatedAt()->format('d/m/Y'),
                $event->getCreatedAt()->format('H:i:s'),
                $event->getBodyTextExcerpt(),
                $eventUrl,
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
        string $proposalUrl,
        string $proposalAdminUrl,
        string $eventTitle
    ): array {
        return [
            '%username%' => self::escape($authorName),
            '%eventTitle%' => self::escape($eventTitle),
            '%date%' => $date,
            '%time%' => $time,
            '%event%' => self::escape($event),
            '%proposalUrl%' => $proposalUrl,
            '%eventUrlBack%' => $proposalAdminUrl,
        ];
    }

    private static function getMySubjectVars(string $username): array
    {
        return [
            '%username%' => self::escape($username),
        ];
    }
}
