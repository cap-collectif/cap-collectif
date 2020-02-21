<?php

namespace Capco\AppBundle\Mailer\Message\Argument;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class TrashedArgumentAuthorMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'notification-subject-argument-trashed';
    public const TEMPLATE = 'notification-content-argument-trashed';

    public static function getMyTemplateVars(Argument $argument, array $params): array
    {
        return [
            '{trashedReason}' => self::escape($argument->getTrashedReason()),
            '{body}' => self::escape($argument->getBody()),
            '{trashedDate}' => $argument->getTrashedAt()->format('d/m/Y'),
            '{trashedTime}' => $argument->getTrashedAt()->format('H:i:s'),
            '{argumentLink}' => $params['elementURL'],
        ];
    }

    public static function getMySubjectVars(Argument $argument, array $params): array
    {
        return [
            '{proposalTitle}' => self::escape($argument->getRelated()->getTitle())
        ];
    }
}
