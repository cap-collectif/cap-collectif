<?php

namespace Capco\AppBundle\Mailer\Message\UserArchive;

use Capco\AppBundle\Entity\UserArchive;
use Capco\AppBundle\Mailer\Message\DefaultMessage;

final class UserArchiveGeneratedMessage extends DefaultMessage
{
    public static function create(
        UserArchive $userArchive,
        string $siteUrl,
        string $sitename,
        string $downloadUrl,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'email-name-download-copy',
            static::getMySubjectVars(),
            '@CapcoMail/archiveReady.html.twig',
            static::getMyTemplateVars(
                $userArchive,
                $siteUrl,
                $sitename,
                $downloadUrl,
                $recipentEmail
            )
        );
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }

    private static function getMyTemplateVars(
        UserArchive $archive,
        string $siteUrl,
        string $sitename,
        string $downloadUrl,
        string $recipientEmail
    ): array {
        return [
            'archive' => $archive,
            'siteUrl' => $siteUrl,
            'sitename' => $sitename,
            'downloadUrl' => $downloadUrl,
            'business' => 'Cap Collectif',
            'businessUrl' => 'https://cap-collectif.com/',
            'to' => self::escape($recipientEmail),
        ];
    }
}
