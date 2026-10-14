<?php

namespace Capco\AppBundle\Provider;

use Capco\AppBundle\Entity\Media;
use Gaufrette\Filesystem;
use Liip\ImagineBundle\Imagine\Cache\CacheManager;
use Symfony\Component\Filesystem\Filesystem as LocalFilesystem;
use Symfony\Component\HttpFoundation\File\File;

class MediaProvider
{
    public const PRIVATE_VOICE_MESSAGES_DIRECTORY = 'var/vocal-contributions';

    public function __construct(
        protected Filesystem $filesystem,
        protected CacheManager $cacheManager,
        private readonly string $projectDir
    ) {
    }

    public function generatePublicUrl(Media $media, string $format): string
    {
        $path = $this->prefixSlash($this->getImagePath($media));

        if ('admin' !== $format && 'reference' !== $format) {
            $path = $this->cacheManager->getBrowserPath($path, $format);
        }

        return $path;
    }

    public function getFormatName(Media $media, string $format): string
    {
        if ('admin' === $format || 'reference' === $format || 'default' === $format) {
            return $format;
        }

        return $media->getContext() . '_' . $format;
    }

    public function getOrGenerateReferenceFile(Media $media): \Gaufrette\File
    {
        if (Media::VOCAL_CONTRIBUTION_CONTEXT === $media->getContext()) {
            throw new \LogicException('Voice messages must be read through the protected admin route.');
        }

        return $this->filesystem->get($this->getImagePath($media), true);
    }

    public function writeBinaryContentInFile(Media $media): void
    {
        if (null === $media->getBinaryContent()) {
            return;
        }

        try {
            if (Media::VOCAL_CONTRIBUTION_CONTEXT === $media->getContext()) {
                (new LocalFilesystem())->copy($media->getBinaryContent()->getPathname(), $this->getPrivateVoiceMessagePath($media));
            } else {
                $this->setFileContents($media);
            }
        } catch (\Throwable $exception) {
            if (Media::VOCAL_CONTRIBUTION_CONTEXT === $media->getContext()) {
                $this->removePrivateVoiceMessageFile($media);
            }

            throw $exception;
        }
        $media->resetBinaryContent();
    }

    public function getPrivateVoiceMessagePath(Media $media): string
    {
        if (Media::VOCAL_CONTRIBUTION_CONTEXT !== $media->getContext()) {
            throw new \InvalidArgumentException('Expected a voice message.');
        }

        return $this->projectDir . '/' . self::PRIVATE_VOICE_MESSAGES_DIRECTORY . '/' . basename($media->getProviderReference());
    }

    public function removePrivateVoiceMessageFile(Media $media): void
    {
        (new LocalFilesystem())->remove($this->getPrivateVoiceMessagePath($media));
    }

    public function generateName(Media $media): string
    {
        return $this->generateId($media) . '.' . $media->getBinaryContent()->guessExtension();
    }

    protected function setFileContents(Media $media, ?string $contents = null): void
    {
        $file = $this->getOrGenerateReferenceFile($media);

        if ($contents) {
            $file->setContent($contents);

            return;
        }

        $binaryContent = $media->getBinaryContent();
        if ($binaryContent instanceof File) {
            $file->setContent(
                file_get_contents($binaryContent->getRealPath() ?: $binaryContent->getPathname())
            );
        }
    }

    protected function getImagePath(Media $media): string
    {
        return $this->getDirectoryPath($media) . '/' . $media->getProviderReference();
    }

    protected function getDirectoryPath(Media $media): string
    {
        return $media->getContext() . '/0001/01';
    }

    protected function generateId(Media $media): string
    {
        return sha1($media->getName() . uniqid() . random_int(11111, 99999));
    }

    protected function prefixSlash(string $path): string
    {
        return '/' . ltrim($path, '/');
    }
}
