<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\Entity\Event;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class EventReviewMessage extends EventMessage
{

    public static function mockData(ContainerInterface $container, string $template)
    {
        return parent::mockData($container, $template) + ['eventStatus' => 'success'];
    }

    public static function create(
        Event $event,
        string $baseUrl,
        string $siteName,
        string $siteUrl,
        string $recipientName = null
    ): self {
        $message = new self(
            $event->getAuthor()->getEmail(),
            $event->getAuthor()->getUsername(),
            'event-approved',
            static::getMySubjectVars($event->getTitle()),
            '@CapcoMail/Admin/notifyUserReviewedEvent.html.twig',
            static::getMyTemplateVars(
                $event,
                $baseUrl,
                $siteName,
                $siteUrl,
                $recipientName
            )
        );

        return $message;
    }

    protected static function getMyTemplateVars(
        Event $event,
        string $baseUrl,
        string $siteName,
        string $siteUrl,
        string $recipientName = null,
        ?string $eventUrl = null
    ): array {
        return [
                'eventStatus' => $event->getStatus(),
                'eventRefusedReason' => $event->getReview()->getRefusedReason(),
                'eventComment' => $event->getReview()->getComment(),
            ] + parent::getMyTemplateVars($event, $baseUrl, $siteName, $siteUrl, $recipientName, $eventUrl);
    }
}
