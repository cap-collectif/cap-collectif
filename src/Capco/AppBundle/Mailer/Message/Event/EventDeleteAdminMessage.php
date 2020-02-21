<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class EventDeleteAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'event-deleted-notification';
    public const TEMPLATE = '@CapcoMail/Admin/notifyAdminOfDeletedEvent.html.twig';
    public const FOOTER = '';

    public static function getMySubjectVars(Event $event, array $params): array
    {
        return [
            '{eventTitle}' => self::escape($event->getTitle())
        ];
    }

    public static function getMyTemplateVars(Event $event, array $params): array
    {
        return [
            'eventTitle' => self::escape($event->getTitle()),
            'eventUrl' => $params['baseURL'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'siteUrl' => $params['siteURL'],
            'username' => $params['username']
        ];
    }
}
