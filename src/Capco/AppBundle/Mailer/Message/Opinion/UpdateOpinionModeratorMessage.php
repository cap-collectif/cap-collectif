<?php

namespace Capco\AppBundle\Mailer\Message\Opinion;

use Capco\AppBundle\Mailer\Message\AbstractModeratorMessage;
use Capco\AppBundle\Model\ModerableInterface;

final class UpdateOpinionModeratorMessage extends AbstractModeratorMessage
{
    public const SUBJECT = 'notification-subject-modified-proposal';
    public const TEMPLATE = 'notification-content-modified-proposal';

    public static function getMyTemplateVars(ModerableInterface $moderable, array $params): array
    {
        return [
            '{title}' => self::escape($moderable->getTitle()),
            '{body}' => self::escape(self::cleanHtml($moderable->getBody())),
            '{updatedDate}' => null === $moderable->getUpdatedAt()
                    ? $moderable->getCreatedAt()->format('d/m/Y')
                    : $moderable->getUpdatedAt()->format('d/m/Y'),
            '{updatedTime}' => null === $moderable->getUpdatedAt()
                    ? $moderable->getCreatedAt()->format('H:i:s')
                    : $moderable->getUpdatedAt()->format('H:i:s'),
            '{authorName}' => self::escape($moderable->getAuthor()->getUsername()),
            '{authorLink}' => $params['authorURL'],
            '{opinionLink}' => $params['moderableURL'],
        ];
    }

    public static function getMySubjectVars(ModerableInterface $moderable, array $params): array
    {
        return [
            '{proposalTitle}' => self::escape($moderable->getTitle()),
            '{authorName}' => self::escape($moderable->getAuthor()->getUsername()),
        ];
    }
}
