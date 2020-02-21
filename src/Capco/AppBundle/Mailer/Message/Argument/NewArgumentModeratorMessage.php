<?php

namespace Capco\AppBundle\Mailer\Message\Argument;

use Capco\AppBundle\Mailer\Message\AbstractModeratorMessage;
use Capco\AppBundle\Model\ModerableInterface;

final class NewArgumentModeratorMessage extends AbstractModeratorMessage
{
    public const SUBJECT = 'notification-subject-new-argument';
    public const TEMPLATE = 'notification-content-new-argument';

    public static function getMyTemplateVars(ModerableInterface $moderable, array $params): array
    {
        return [
            '{type}' => $params['translator']->trans($moderable->getTypeAsString(), ['_locale' => $params['locale']], 'CapcoAppBundle'),
            '{body}' => self::escape($moderable->getBody()),
            '{createdDate}' => $moderable->getCreatedAt()->format('d/m/Y'),
            '{createdTime}' => $moderable->getCreatedAt()->format('H:i:s'),
            '{authorName}' => self::escape($moderable->getAuthor()->getUsername()),
            '{authorLink}' => $params['authorURL'],
            '{argumentLink}' => $params['moderableURL'],
        ];
    }

    public static function getMySubjectVars(ModerableInterface $moderable, array $params): array
    {
        return [
            '{proposalTitle}' => self::escape($moderable->getRelated()->getTitle()),
            '{authorName}' => self::escape($moderable->getAuthor()->getUsername()),
        ];
    }
}
