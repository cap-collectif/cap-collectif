<?php

namespace Capco\AppBundle\Mailer\Message;

use Capco\AppBundle\Mailer\Message\Event\EventCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Event\EventDeleteAdminMessage;
use Capco\AppBundle\Mailer\Message\Event\EventDeleteMessage;
use Capco\AppBundle\Mailer\Message\Event\EventEditAdminMessage;

final class MessagesList
{
    public const MESSAGES_LIST = [
        'event_create_admin' => EventCreateAdminMessage::class,
        'event_edit_admin' => EventEditAdminMessage::class,
        'event_delete_admin' => EventDeleteAdminMessage::class,
        'event_delete' => EventDeleteMessage::class
    ];

    public const TEMPLATE_LIST = [
        'event_create_admin' => '@CapcoMail/Admin/notifyAdminOfNewEvent.html.twig',
        'event_edit_admin' => '@CapcoMail/Admin/notifyAdminOfEditedEvent.html.twig',
        'event_delete_admin' => '@CapcoMail/Admin/notifyAdminOfDeletedEvent.html.twig',
        'event_delete' => '@CapcoMail/notifyParticipantOfDeletedEvent.html.html.twig'
    ];
}
