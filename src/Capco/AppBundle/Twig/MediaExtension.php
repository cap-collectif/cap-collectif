<?php

namespace Capco\AppBundle\Twig;

use Sonata\Doctrine\Model\ManagerInterface;
use Sonata\MediaBundle\Model\MediaInterface;
use Sonata\MediaBundle\Provider\MediaProviderInterface;
use Sonata\MediaBundle\Provider\Pool;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Twig\TwigFunction;

class MediaExtension extends \Sonata\MediaBundle\Twig\Extension\MediaExtension
{
    protected $container;
    private $assetsHost;
    private $routerRequestContextHost;

    public function __construct(Pool $mediaService, ManagerInterface $mediaManager, ContainerInterface $container, string $routerRequestContextHost, ?string $assetsHost = null)
    {
        parent::__construct($mediaService, $mediaManager);
        $this->container = $container;
        $this->assetsHost = $assetsHost;
        $this->routerRequestContextHost = $routerRequestContextHost;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('media_public_url', [$this, 'getMediaUrl'])];
    }

    public function thumbnail($media, $format, $options = [])
    {
        $media = $this->getMedia($media);

        if (null === $media) {
            return '';
        }

        $provider = $this->getMediaService()
            ->getProvider($media->getProviderName());

        $format = $provider->getFormatName($media, $format);
        $format_definition = $provider->getFormat($format);

        // build option
        $defaultOptions = [
            'title' => $media->getName(),
            'alt' => $media->getName(),
        ];

        if ($format_definition['width']) {
            $defaultOptions['width'] = $format_definition['width'];
        }
        if ($format_definition['height']) {
            $defaultOptions['height'] = $format_definition['height'];
        }

        $options = array_merge($defaultOptions, $options);

        $options['src'] = $this->generatePublicUrlForProvider($provider, $media, $format);

        return $this->render($provider->getTemplate('helper_thumbnail'), [
            'media' => $media,
            'options' => $options,
        ]);
    }

    public function path($media, $format): string
    {
        $media = $this->getMedia($media);

        if (!$media) {
            return '';
        }

        $provider = $this->getMediaService()
            ->getProvider($media->getProviderName());

        $format = $provider->getFormatName($media, $format);

        return $this->generatePublicUrlForProvider($provider, $media, $format);
    }

    public function getMediaUrl($media, $format)
    {
        if (!$media) {
            return;
        }
        /** @var MediaProviderInterface $provider */
        $provider = $this->container->get($media->getProviderName());

        return $this->generatePublicUrlForProvider($provider, $media, $format);
    }

    private function generatePublicUrlForProvider(MediaProviderInterface $provider, MediaInterface $media, string $format)
    {
        return $this->assetsHost ?
            str_replace(
                $this->routerRequestContextHost,
                $this->assetsHost,
                $provider->generatePublicUrl($media, $format)
            ) :
            $provider->generatePublicUrl($media, $format);
    }

    private function getMedia($media): ?MediaInterface
    {
        if (!$media instanceof MediaInterface && (string)$media !== '') {
            $media = $this->mediaManager->findOneBy([
                'id' => $media,
            ]);
        }

        if (!$media instanceof MediaInterface) {
            return null;
        }

        if (MediaInterface::STATUS_OK !== $media->getProviderStatus()) {
            return null;
        }

        return $media;
    }
}
