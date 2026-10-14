<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\VocalContribution;
use Symfony\Component\Mime\MimeTypes;

final class VocalContributionFilenameResolver
{
    public function resolve(VocalContribution $vocalContribution): string
    {
        $contentType = $vocalContribution->getMedia()->getContentType() ?? '';
        $extension = match ($contentType) {
            'audio/webm' => 'webm',
            'audio/ogg' => 'ogg',
            'audio/mp4' => 'mp4',
            'audio/x-m4a' => 'm4a',
            default => MimeTypes::getDefault()->getExtensions($contentType)[0] ?? 'bin',
        };

        return $vocalContribution->getId() . '.' . $extension;
    }
}
