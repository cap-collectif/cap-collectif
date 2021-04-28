<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;
use Capco\AppBundle\Traits\EventMockDataTrait;

final class EventDeleteAdminMessage extends AbstractAdminMessage
{
    use EventMockDataTrait;
    public const SUBJECT = 'event-deleted-notification-new';
    public const TEMPLATE = '@CapcoMail/Admin/notifyAdminOfDeletedEvent.html.twig';
    public const FOOTER = '';

    public static function getMySubjectVars(Event $event, array $params): array
    {
        return [
            '{eventTitle}' => self::escape($event->getTitle()),
            '{PlateformName}' => $params['siteName'],
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
            'username' => $params['username'],
        ];
    }
}
