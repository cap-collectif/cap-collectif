<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;
use Capco\AppBundle\Traits\EventMockDataTrait;

final class EventEditAdminMessage extends AbstractAdminMessage
{
    use EventMockDataTrait;
    public const SUBJECT = 'event-needing-examination-new';
    public const TEMPLATE = '@CapcoMail/Admin/notifyAdminOfEditedEvent.html.twig';
    public const FOOTER = '';

    public static function getMySubjectVars(Event $event, array $params): array
    {
        return [
            '{PlateformName}' => $params['siteName'],
        ];
    }

    public static function getMyTemplateVars(Event $event, array $params): array
    {
        return [
            'eventTitle' => self::escape($event->getTitle()),
            'eventUrl' => $params['eventURL'],
            'eventURLExcerpt' => $params['eventURLExcerpt'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'siteUrl' => $params['siteURL'],
            'username' => $params['username'],
        ];
    }
}
