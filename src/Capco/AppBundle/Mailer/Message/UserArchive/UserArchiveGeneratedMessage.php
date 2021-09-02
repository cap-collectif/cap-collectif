<?php

namespace Capco\AppBundle\Mailer\Message\UserArchive;

use Capco\AppBundle\Entity\UserArchive;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class UserArchiveGeneratedMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'email-name-download-copy';
    public const TEMPLATE = '@CapcoMail/archiveReady.html.twig';

    public static function getMySubjectVars(UserArchive $archive, array $params): array
    {
        return [];
    }

    public static function getMyTemplateVars(UserArchive $archive, array $params): array
    {
        return [
            'archive' => $archive,
            'siteUrl' => $params['siteURL'],
            'sitename' => $params['siteName'],
            'downloadUrl' => $params['downloadURL'],
            'business' => 'Cap Collectif',
            'businessUrl' => 'https://cap-collectif.com/',
            'to' => self::escape($archive->getUser()->getEmail()),
            'baseUrl' => $params['siteURL'],
        ];
    }
}
