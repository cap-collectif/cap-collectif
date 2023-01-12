<?php

namespace Capco\AppBundle\Manager;

use Capco\MediaBundle\Entity\Media;
use Capco\MediaBundle\Provider\MediaProvider;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class MediaManager
{
    protected EntityManagerInterface $entityManager;
    protected MediaProvider $mediaProvider;

    public function __construct(EntityManagerInterface $entityManager, MediaProvider $mediaProvider)
    {
        $this->entityManager = $entityManager;
        $this->mediaProvider = $mediaProvider;
    }

    public function createFileFromUploadedFile(
        UploadedFile $file,
        string $context = 'default',
        ?string $providerReference = null
    ): Media {
        $media = new Media();
        $media->setProviderName(MediaProvider::class);
        $media->setBinaryContent($file);
        $media->setProviderReference(
            $providerReference ?: $this->mediaProvider->generateName($media)
        );
        $media->setName($file->getClientOriginalName());
        $media->setContentType($file->getMimeType());
        $media->setSize($file->getSize());
        $media->setContext($context);
        $media->setEnabled(true);
        $this->entityManager->persist($media);
        $this->mediaProvider->writeBinaryContentInFile($media);
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
        $media->setProviderName(MediaProvider::class);
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
}
