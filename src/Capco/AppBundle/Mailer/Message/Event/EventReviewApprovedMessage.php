<?php

namespace Capco\AppBundle\Mailer\Message\Event;

use Capco\AppBundle\DBAL\Enum\EventReviewRefusedReasonType;
use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\AppBundle\Traits\EventMockDataTrait;

class EventReviewApprovedMessage extends AbstractExternalMessage
{
    use EventMockDataTrait;
    public const SUBJECT = 'event-approved-new';
    public const TEMPLATE = '@CapcoMail/Event/notifyUserReviewedEvent.html.twig';
    public const FOOTER = '';

    public static function getMyTemplateVars(Event $event, array $params): array
    {
        $var = [
            'eventTitle' => self::escape($event->getTitle()),
            'eventUrl' => $params['eventURL'],
            'eventURLExcerpt' => $params['eventURLExcerpt'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'siteUrl' => $params['siteURL'],
            'username' => $event->getAuthor()->getUsername(),
            'eventStatus' => $event->getStatus(),
            'color' =>
                EventReviewStatusType::APPROVED === $event->getStatus() ? '#088A20' : '#dc3445',
        ];

        if (EventReviewStatusType::REFUSED === $event->getStatus()) {
            $var = array_merge($var, [
                'adminEmail' => $event
                    ->getReview()
                    ->getReviewer()
                    ->getEmail(),
                'eventRefusedReason' =>
                    EventReviewRefusedReasonType::$refusedReasonsLabels[
                        $event->getReview()->getRefusedReason()
                    ],
                'eventComment' => $event->getReview()->getComment(),
            ]);
        }

        return $var;
    }

    public static function getMySubjectVars(Event $event, array $params): array
    {
        return [
            '{eventTitle}' => self::escape($event->getTitle()),
            '{PlateformName}' => $params['siteName'],
        ];
    }

    public static function getMyFooterVars(
        string $recipientEmail = '',
        string $siteName = '',
        string $siteURL = ''
    ): array {
        return [];
    }
}
