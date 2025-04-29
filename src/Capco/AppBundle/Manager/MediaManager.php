<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Provider\MediaProvider;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class MediaManager
{
    public function __construct(protected EntityManagerInterface $entityManager, protected MediaProvider $mediaProvider)
    {
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
        string $context = 'default',
        ?bool $createFile = true
    ): Media {
        $media = new Media();
        $media->setProviderName(MediaProvider::class);
        $file = new File($path);
        $media->setBinaryContent($file);
        $media->setSize($file->getSize());
        $media->setContentType($file->getMimeType());
        $media->setContext($context);
        $media->setEnabled(true);
        $media->setName($mediaName);
        $media->setProviderReference($this->mediaProvider->generateName($media));
        if (!$dryRun) {
            $this->entityManager->persist($media);
            if ($createFile) {
                $this->mediaProvider->writeBinaryContentInFile($media);
            }
        }

        return $media;
    }
}
