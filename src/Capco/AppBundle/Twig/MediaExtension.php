<?php

namespace Capco\AppBundle\Twig;

use Sonata\Doctrine\Model\ManagerInterface;
use Sonata\MediaBundle\Model\MediaInterface;
use Sonata\MediaBundle\Provider\MediaProviderInterface;
use Sonata\MediaBundle\Provider\Pool;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Twig\TwigFunction;

/*
 * I had to reimplement Sonata\MediaBundle\Twig\Extension\MediaExtension because we could not specify
 * a custom host in sonata media bundle config. I override `path` and `thumbnail` method to
 * take in account custom assets host (if env var `SYMFONY_ASSETS_HOST` is defined) to load files from the custom host.
 * It allows us to load assets from `assets.cap.co` when using Symfony binary because we can not define
 * particular rewrite rules like nginx when using the internal PHP server, and this one serve to handle
 * Liip Imagine files location.
 */
class MediaExtension extends \Sonata\MediaBundle\Twig\Extension\MediaExtension
{
    protected $container;
    private $assetsHost;
    private $routerRequestContextHost;

    public function __construct(
        Pool $mediaService,
        ManagerInterface $mediaManager,
        ContainerInterface $container,
        string $routerRequestContextHost,
        ?string $assetsHost = null
    ) {
        parent::__construct($mediaService, $mediaManager);
        $this->container = $container;
        $this->assetsHost = $assetsHost;
        $this->routerRequestContextHost = $routerRequestContextHost;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('media_public_url', [$this, 'getMediaUrl'])];
    }

    public function getMediaUrl($media, $format)
    {
        if (!$media) {
            return '';
        }
        /** @var MediaProviderInterface $provider */
        $provider = $this->container->get($media->getProviderName());

        return $this->generatePublicUrlForProvider($provider, $media, $format);
    }

    private function generatePublicUrlForProvider(
        MediaProviderInterface $provider,
        MediaInterface $media,
        string $format
    ) {
        return $this->assetsHost
            ? str_replace(
                $this->routerRequestContextHost,
                $this->assetsHost,
                $provider->generatePublicUrl($media, $format)
            )
            : $provider->generatePublicUrl($media, $format);
    }
}
