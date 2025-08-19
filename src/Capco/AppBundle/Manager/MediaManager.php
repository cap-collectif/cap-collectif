<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Provider\AllowedExtensions;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Validator\Constraints\MaxFolderSize;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Constraints\File as FileConstraint;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class MediaManager
{
    public function __construct(
        private readonly string $mediaSizeLimit,
        private readonly EntityManagerInterface $entityManager,
        private readonly MediaProvider $mediaProvider,
        private readonly ValidatorInterface $validator,
        private readonly LoggerInterface $logger
    ) {
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

    /**
     * For security reasons, we have to check the file size, type and if it is infected by a virus.
     */
    public function validateUploadedFile(UploadedFile $file): bool
    {
        $violations = $this->validator->validate($file, [
            new FileConstraint([
                'maxSize' => $this->mediaSizeLimit,
                'mimeTypes' => AllowedExtensions::ALLOWED_MIMETYPES,
            ]),
            new MaxFolderSize(),
        ]);

        $violationsCount = $violations->count();

        if (0 < $violationsCount) {
            $this->logger->error(
                'An error occured while uploading the file',
                [
                    'method' => __METHOD__,
                    'file-myme-type' => $file->getMimeType(),
                    'file-size' => $file->getSize(),
                    'violations' => $violations,
                ]
            );

            throw new \RuntimeException('An error occured while validating uploaded file.');
        }

        return 0 === $violationsCount;
    }

    public static function formatBytes(int $bytes): string
    {
        $units = ['O', 'Ko', 'Mo', 'Go', 'To'];
        $power = $bytes > 0 ? floor(log($bytes, 1024)) : 0;

        return number_format($bytes / 1024 ** $power, 1) . ' ' . $units[$power];
    }
}
