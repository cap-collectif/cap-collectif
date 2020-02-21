<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class EventEditAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'event-awaiting-publication';
    public const TEMPLATE = '@CapcoMail/Admin/notifyAdminOfEditedEvent.html.twig';
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
            'eventUrl' => $params['eventURL'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'siteUrl' => $params['siteURL'],
            'username' => $params['username']
        ];
    }
}
