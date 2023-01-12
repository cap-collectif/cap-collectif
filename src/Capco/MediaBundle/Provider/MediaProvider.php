<?php

namespace Capco\MediaBundle\Provider;

use Capco\MediaBundle\Entity\Media;
use Gaufrette\Filesystem;
use Imagine\Imagick\Imagine;
use Liip\ImagineBundle\Imagine\Cache\CacheManager;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\Form\Validator\ErrorElement;
use Sonata\MediaBundle\Metadata\ProxyMetadataBuilder;
use Sonata\MediaBundle\Model\MediaInterface;
use Sonata\MediaBundle\Provider\MediaProviderInterface;
use Sonata\MediaBundle\Provider\Metadata;
use Sonata\MediaBundle\Resizer\SimpleResizer;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\Form\FormBuilder;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\Response;

class MediaProvider implements MediaProviderInterface
{
    protected CacheManager $cacheManager;
    protected Filesystem $filesystem;

    public function __construct(Filesystem $fileSystem, CacheManager $cacheManager)
    {
        $this->filesystem = $fileSystem;
        $this->cacheManager = $cacheManager;
    }

    public function generatePublicUrl(MediaInterface $media, $format): string
    {
        $path = $this->prefixSlash($this->getImagePath($media));

        if ('admin' !== $format && 'reference' !== $format) {
            $path = $this->cacheManager->getBrowserPath($path, $format);
        }

        return $path;
    }

    public function getFormatName(MediaInterface $media, $format): string
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
     * Stubs for Sonata MediaProviderInterface, to remove when not needed anymore.
     */
    public function addFormat($name, $format)
    {
    }

    public function getFormat($name)
    {
        return false;
    }

    public function requireThumbnails()
    {
        return false;
    }

    public function generateThumbnails(MediaInterface $media)
    {
    }

    public function removeThumbnails(MediaInterface $media, $formats = null)
    {
    }

    public function getReferenceFile(MediaInterface $media)
    {
        return new \Gaufrette\File('', $this->filesystem);
    }

    public function getReferenceImage(MediaInterface $media)
    {
        return '';
    }

    public function preUpdate(MediaInterface $media)
    {
    }

    public function postUpdate(MediaInterface $media)
    {
    }

    public function preRemove(MediaInterface $media)
    {
    }

    public function postRemove(MediaInterface $media)
    {
    }

    public function buildCreateForm(FormMapper $formMapper)
    {
    }

    public function buildEditForm(FormMapper $formMapper)
    {
    }

    public function prePersist(MediaInterface $media)
    {
    }

    public function postPersist(MediaInterface $media)
    {
    }

    public function getHelperProperties(MediaInterface $media, $format, $options = [])
    {
    }

    public function generatePath(MediaInterface $media)
    {
        return '';
    }

    public function generatePrivateUrl(MediaInterface $media, $format)
    {
        return '';
    }

    public function getFormats()
    {
        return [];
    }

    public function setName($name)
    {
    }

    public function getName()
    {
        return '';
    }

    public function getProviderMetadata()
    {
        return new Metadata('');
    }

    public function setTemplates(array $templates)
    {
    }

    public function getTemplates()
    {
        return [];
    }

    public function getTemplate($name)
    {
        return '';
    }

    public function getDownloadResponse(MediaInterface $media, $format, $mode, array $headers = [])
    {
        return new Response();
    }

    public function getResizer()
    {
        return new SimpleResizer(new Imagine(), '', new ProxyMetadataBuilder(new Container()));
    }

    public function getFilesystem()
    {
        return $this->filesystem;
    }

    public function getCdnPath($relativePath, $isFlushable)
    {
    }

    public function transform(MediaInterface $media)
    {
    }

    public function validate(ErrorElement $errorElement, MediaInterface $media)
    {
    }

    public function buildMediaType(FormBuilder $formBuilder)
    {
    }

    public function updateMetadata(MediaInterface $media, $force = false)
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
