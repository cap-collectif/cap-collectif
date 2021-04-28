<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\AppBundle\Traits\EventMockDataTrait;

final class EventDeleteMessage extends AbstractExternalMessage
{
    use EventMockDataTrait;
    public const SUBJECT = 'event-canceled-notification-new';
    public const TEMPLATE = '@CapcoMail/Event/notifyParticipantOfDeletedEvent.html.twig';
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
            'eventUrl' => $params['eventURL'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'siteUrl' => $params['siteURL'],
            'username' => $params['username'],
        ];
    }
}
