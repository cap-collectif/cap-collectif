<?php

namespace Capco\AppBundle\Mailer\Message\Argument;

use Capco\AppBundle\Mailer\Message\AbstractModeratorMessage;
use Capco\AppBundle\Model\ModerableInterface;

final class UpdateArgumentModeratorMessage extends AbstractModeratorMessage
{
    public const SUBJECT = 'notification-subject-modified-argument';
    public const TEMPLATE = 'notification-content-modified-argument';

    public static function getMyTemplateVars(ModerableInterface $moderable, array $params): array
    {
        return [
            '{type}' => $params['translator']->trans(
                $moderable->getTypeAsString(),
                ['_locale' => $params['locale']],
                'CapcoAppBundle'
            ),
            '{body}' => self::escape($moderable->getBody()),
            '{updatedDate}' => $moderable->getUpdatedAt()->format('d/m/Y'),
            '{updatedTime}' => $moderable->getUpdatedAt()->format('H:i:s'),
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
