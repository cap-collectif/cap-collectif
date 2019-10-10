<?php

namespace Capco\AppBundle\Mailer\Message\Project;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Mailer\Message\DefaultMessage;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\SiteParameter\Resolver;

final class QuestionnaireAcknowledgeReplyMessage extends DefaultMessage
{
    public static function create(
        string $recipientEmail,
        Reply $reply,
        string $projectTitle,
        \DateTimeInterface $replyUpdatedAt,
        string $siteName,
        string $state,
        string $userUrl,
        string $configUrl,
        string $baseUrl,
        string $stepUrl,
        string $questionnaireStepTitle,
        Resolver $siteParams
    ): self {
        return new self(
            $recipientEmail,
            null,
            "reply.notify.user.${state}",
            static::getMySubjectVars($questionnaireStepTitle),
            '@CapcoMail/acknowledgeReply.html.twig',
            static::getMyTemplateVars(
                $projectTitle,
                $replyUpdatedAt,
                $siteName,
                $reply,
                $state,
                $userUrl,
                $configUrl,
                $baseUrl,
                $stepUrl,
                $siteParams
            )
        );
    }

    private static function getMyTemplateVars(
        string $title,
        \DateTimeInterface $updatedAt,
        string $siteName,
        Reply $reply,
        string $state,
        string $userUrl,
        string $configUrl,
        string $baseUrl,
        string $stepUrl,
        Resolver $siteParams
    ): array {
        $locale = $siteParams->getValue('global.locale');
        $timezone = $siteParams->getValue('global.timezone');
        $fmt = new \IntlDateFormatter(
            $locale,
            \IntlDateFormatter::FULL,
            \IntlDateFormatter::NONE,
            $timezone,
            \IntlDateFormatter::GREGORIAN
        );

        $date = '';
        if (
            QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE === $state &&
            $reply->getPublishedAt()
        ) {
            $date = $reply->getPublishedAt();
        }
        if (
            QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_UPDATE_STATE === $state &&
            $reply->getUpdatedAt()
        ) {
            $date = $reply->getUpdatedAt();
        }
        if (empty($date)) {
            throw new \RuntimeException(
                sprintf('Reply with id %s is not able to be send', $reply->getId())
            );
        }

        $endDate = '';
        if ($reply->getStep()) {
            $endDate = $fmt->format(
                $reply
                    ->getStep()
                    ->getEndAt()
                    ->getTimestamp()
            );
        }

        return [
            'projectTitle' => self::escape($title),
            'replyUpdatedAt' => $updatedAt,
            'siteName' => self::escape($siteName),
            'date' => $fmt->format($date->getTimestamp()),
            'time' => $date->format('H:i:s'),
            'authorName' => $reply->getAuthor() ? $reply->getAuthor()->getUsername() : '',
            'questionnaireStepTitle' => $reply->getStep() ? $reply->getStep()->getTitle() : '',
            'questionnaireEndDate' => $endDate,
            'state' => $state,
            'userUrl' => $userUrl,
            'configUrl' => $configUrl,
            'baseUrl' => $baseUrl,
            'stepUrl' => $stepUrl,
            'timeless' => $reply->getStep() ? $reply->getStep()->isTimeless() : false
        ];
    }

    private static function getMySubjectVars(string $questionnaireStepTitle): array
    {
        return [
            '{questionnaireStepTitle}' => $questionnaireStepTitle
        ];
    }
}
