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
                $eventAdminUrl,
                $baseUrl,
                $siteName,
                $siteUrl,
                $recipientName
            )
        );

        return $message;
    }

    public function getFooterTemplate(): string
    {
        return '';
    }

    private static function getMyTemplateVars(
        Event $event,
        string $eventAdminUrl,
        string $baseUrl,
        string $siteName,
        string $siteUrl,
        string $recipientName = null
    ): array {
        return [
            'eventTitle' => self::escape($event->getTitle()),
            'eventAdminUrl' => $eventAdminUrl,
            'baseUrl' => $baseUrl,
            'siteName' => $siteName,
            'siteUrl' => $siteUrl,
            'username' => $recipientName
        ];
    }

    private static function getMySubjectVars(string $eventTitle): array
    {
        return [
            '{eventTitle}' => self::escape($eventTitle)
        ];
    }
}
