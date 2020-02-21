<?php

namespace Capco\AppBundle\Mailer\Message\Opinion;

use Capco\AppBundle\Mailer\Message\AbstractModeratorMessage;
use Capco\AppBundle\Model\ModerableInterface;

final class NewOpinionModeratorMessage extends AbstractModeratorMessage
{
    public const SUBJECT = 'notification-subject-new-proposal';
    public const TEMPLATE = 'notification-content-new-proposal';

    public static function getMyTemplateVars(ModerableInterface $moderable, array $params): array {
        return [
            '{title}' => self::escape($moderable->getTitle()),
            '{body}' => self::escape(self::cleanHtml($moderable->getBody())),
            '{createdDate}' => $moderable->getCreatedAt()->format('d/m/Y'),
            '{createdTime}' => $moderable->getCreatedAt()->format('H:i:s'),
            '{authorName}' => self::escape($moderable->getAuthor()->getUsername()),
            '{authorLink}' => $params['authorURL'],
            '{opinionLink}' => $params['moderableURL'],
        ];
    }

    public static function getMySubjectVars(ModerableInterface $moderable, array $params): array {
        return [
            '{proposalTitle}' => self::escape($moderable->getTitle()),
            '{authorName}' => self::escape($moderable->getAuthor()->getUsername()),
        ];
    }
}
