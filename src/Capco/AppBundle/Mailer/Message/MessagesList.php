<?php

namespace Capco\AppBundle\Mailer\Message;

use Capco\AppBundle\Mailer\Message\Event\EventCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Event\EventDeleteAdminMessage;
use Capco\AppBundle\Mailer\Message\Event\EventDeleteMessage;
use Capco\AppBundle\Mailer\Message\Event\EventEditAdminMessage;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalStatusChangeMessage;

final class MessagesList
{
    public const MESSAGES_LIST = [
        'event_create_admin' => EventCreateAdminMessage::class,
        'event_edit_admin' => EventEditAdminMessage::class,
        'event_delete_admin' => EventDeleteAdminMessage::class,
        'event_delete' => EventDeleteMessage::class,
        'proposal_update_status' => ProposalStatusChangeMessage::class
    ];

    public const TEMPLATE_LIST = [
        'event_create_admin' => '@CapcoMail/Admin/notifyAdminOfNewEvent.html.twig',
        'event_edit_admin' => '@CapcoMail/Admin/notifyAdminOfEditedEvent.html.twig',
        'event_delete_admin' => '@CapcoMail/Admin/notifyAdminOfDeletedEvent.html.twig',
        'event_delete' => '@CapcoMail/notifyParticipantOfDeletedEvent.html.twig',
        'proposal_update_status' => '@CapcoMail/Proposal/notifyProposalAuthorStatusChange.html.twig'
    ];
}
