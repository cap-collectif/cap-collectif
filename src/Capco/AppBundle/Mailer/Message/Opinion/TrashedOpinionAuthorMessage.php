<?php

namespace Capco\AppBundle\Mailer\Message\Opinion;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class TrashedOpinionAuthorMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'notification-subject-proposal-in-the-trash';
    public const TEMPLATE = 'notification-content-proposal-in-the-trash';

    public static function getMyTemplateVars(Opinion $opinion, array $params): array
    {
        return [
            '{trashedReason}' => self::escape($opinion->getTrashedReason()),
            '{title}' => self::escape($opinion->getTitle()),
            '{body}' => self::escape(self::cleanHtml($opinion->getBody())),
            '{trashedDate}' => $opinion->getTrashedAt()->format('d/m/Y'),
            '{trashedTime}' => $opinion->getTrashedAt()->format('H:i:s'),
            '{opinionLink}' => $params['elementURL']
        ];
    }

    public static function getMySubjectVars(Opinion $opinion, array $params): array
    {
        return [
            '{title}' => self::escape($opinion->getTitle())
        ];
    }
}
