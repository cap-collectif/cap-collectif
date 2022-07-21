<?php

namespace Capco\AppBundle\Manager;

use Capco\MediaBundle\Entity\Media;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class MediaManager
{
    protected EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function createFileFromUploadedFile(
        UploadedFile $file,
        string $context = 'default',
        ?string $providerReference = null
    ): Media {
        $media = new Media();
        $media->setProviderName($this->resolveProviderName($file));
        $media->setBinaryContent($file);
        if ($providerReference) {
            $media->setProviderReference($providerReference);
        }
        $media->setContext($context);
        $media->setEnabled(true);
        $this->entityManager->persist($media);
        $this->entityManager->flush();

        return $media;
    }

    public function createFileFromFile(
        $file,
        string $filename,
        string $context = 'default',
        ?string $providerReference = null
    ): Media {
        $media = new Media();
        $media->setProviderName('sonata.media.provider.file');
        $media->setName($filename . '.pdf');
        $media->setBinaryContent($file);
        if ($providerReference) {
            $media->setProviderReference($providerReference);
        }
        $media->setContext($context);
        $media->setEnabled(true);
        $this->entityManager->persist($media);
        $this->entityManager->flush();

        return $media;
    }

    public function createImageFromPath(
        string $path,
        ?string $mediaName = null,
        bool $dryRun = false,
        string $context = 'default'
    ): Media {
        $media = new Media();
        $media->setProviderName('sonata.media.provider.image');
        $media->setBinaryContent($path);
        $media->setContext($context);
        $media->setEnabled(true);
        $media->setName($mediaName);
        $media->setProviderReference($mediaName);
        if (!$dryRun) {
            $this->entityManager->persist($media);
            $this->entityManager->flush();
        }

        return $media;
    }

    protected function resolveProviderName(UploadedFile $file): string
    {
        return preg_match('/^image\/[a-z]+/', $file->getClientMimeType())
            ? 'sonata.media.provider.image'
            : 'sonata.media.provider.file';
    }
}
