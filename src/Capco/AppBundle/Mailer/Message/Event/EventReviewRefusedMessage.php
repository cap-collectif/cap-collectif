<?php

namespace Capco\AppBundle\Mailer\Message\Event;

final class EventReviewRefusedMessage extends EventReviewApprovedMessage
{
    public const SUBJECT = 'event-refused-new';
    public const TEMPLATE = '@CapcoMail/Event/notifyUserReviewedRefusedEvent.html.twig';
}
