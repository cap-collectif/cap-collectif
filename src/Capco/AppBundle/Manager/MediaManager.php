<?php

namespace Capco\AppBundle\Manager;

use Capco\MediaBundle\Entity\Media;
use Sonata\MediaBundle\Entity\MediaManager as SonataMediaManager;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class MediaManager
{
    protected SonataMediaManager $mediaManager;

    public function __construct(SonataMediaManager $mediaManager)
    {
        $this->mediaManager = $mediaManager;
    }

    public function createFileFromUploadedFile(
        UploadedFile $file,
        string $context = 'default',
        ?string $providerReference = null
    ): Media {
        /** @var Media $media */
        $media = $this->mediaManager->create();
        $media->setProviderName($this->resolveProviderName($file));
        $media->setBinaryContent($file);
        if ($providerReference) {
            $media->setProviderReference($providerReference);
        }
        $media->setContext($context);
        $media->setEnabled(true);
        $this->mediaManager->save($media);

        return $media;
    }

    public function createFileFromFile(
        $file,
        string $filename,
        string $context = 'default',
        ?string $providerReference = null
    ): Media {
        /** @var Media $media */
        $media = $this->mediaManager->create();
        $media->setProviderName('sonata.media.provider.file');
        $media->setName($filename . '.pdf');
        $media->setBinaryContent($file);
        if ($providerReference) {
            $media->setProviderReference($providerReference);
        }
        $media->setContext($context);
        $media->setEnabled(true);
        $this->mediaManager->save($media);

        return $media;
    }

    public function createImageFromPath(
        string $path,
        ?string $mediaName,
        string $context = 'default'
    ): Media {
        /** @var Media $media */
        $media = $this->mediaManager->create();
        $media->setProviderName('sonata.media.provider.image');
        $media->setBinaryContent($path);
        $media->setContext($context);
        $media->setEnabled(true);
        $media->setName($mediaName);
        $media->setProviderReference($mediaName);

        $this->mediaManager->save($media);

        return $media;
    }

    protected function resolveProviderName(UploadedFile $file): string
    {
        return preg_match('/^image\/[a-z]+/', $file->getClientMimeType())
            ? 'sonata.media.provider.image'
            : 'sonata.media.provider.file';
    }
}
