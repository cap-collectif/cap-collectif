<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\DBAL\Enum\EventReviewRefusedReasonType;
use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Capco\AppBundle\Entity\Event;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class EventReviewMessage extends EventMessage
{

    public static function mockData(ContainerInterface $container, string $template)
    {
        return parent::mockData($container, $template) + [
                'eventStatus' => 'refused',
                'eventRefusedReason' => 'error',
                'comment' => 'pas bien du tqsb qsjbd ojqshdqsod j iodsjm qhgqomhdgqjfgo rhqeo \n sqiodjqspdjqjdbfjsdfhzuofhz ',
                'adminEmail' => 'admin@test.com',
                'color' => '#dc3445',
            ];
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
            '@CapcoMail/Event/notifyUserReviewedEvent.html.twig',
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
        $var = [
                'eventStatus' => $event->getStatus(),
                'color' => $event->getStatus() === EventReviewStatusType::APPROVED ? '#088A20' : '#dc3445',
            ] + parent::getMyTemplateVars($event, $baseUrl, $siteName, $siteUrl, $recipientName, $eventUrl);

        if ($event->getStatus() === EventReviewStatusType::REFUSED) {
            $var = array_merge(
                $var,
                [
                    'adminEmail' => $event->getReview()->getReviewer()->getEmail(),
                    'eventRefusedReason' => EventReviewRefusedReasonType::$refusedReasonsLabels[$event->getReview(
                    )->getRefusedReason()],
                    'eventComment' => $event->getReview()->getComment(),
                ]
            );
        }

        return $var;
    }
}
