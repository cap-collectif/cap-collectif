<?php

namespace Capco\MediaBundle\Provider;

use Capco\MediaBundle\Entity\Media;
use Gaufrette\Filesystem;
use Liip\ImagineBundle\Imagine\Cache\CacheManager;
use Symfony\Component\HttpFoundation\File\File;

class MediaProvider
{
    protected CacheManager $cacheManager;
    protected Filesystem $filesystem;

    public function __construct(Filesystem $fileSystem, CacheManager $cacheManager)
    {
        $this->filesystem = $fileSystem;
        $this->cacheManager = $cacheManager;
    }

    public function generatePublicUrl($media, $format): string
    {
        $path = $this->prefixSlash($this->getImagePath($media));

        if ('admin' !== $format && 'reference' !== $format) {
            $path = $this->cacheManager->getBrowserPath($path, $format);
        }

        return $path;
    }

    public function getFormatName($media, $format): string
    {
        if ('admin' === $format || 'reference' === $format || 'default' === $format) {
            return $format;
        }

        return $media->getContext() . '_' . $format;
    }

    public function getOrGenerateReferenceFile(Media $media): \Gaufrette\File
    {
        return $this->filesystem->get($this->getImagePath($media), true);
    }

    public function writeBinaryContentInFile(Media $media): void
    {
        if (null === $media->getBinaryContent()) {
            return;
        }

        $this->setFileContents($media);
        $media->resetBinaryContent();
    }

    public function generateName(Media $media): string
    {
        return $this->generateId($media) . '.' . $media->getBinaryContent()->guessExtension();
    }

    /**
     * Stubs for Sonata, to remove when not needed anymore.
     *
     * @param mixed $name
     * @param mixed $format
     */
    public function addFormat($name, $format)
    {
    }

    protected function setFileContents(Media $media, ?string $contents = null)
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
