<?php

namespace Capco\AppBundle\Twig;

use Capco\MediaBundle\Entity\Media;
use Capco\MediaBundle\Provider\MediaProvider;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class MediaExtension extends AbstractExtension
{
    private MediaProvider $mediaProvider;
    private string $routerRequestContextHost;
    private ?string $assetsHost;

    public function __construct(
        MediaProvider $mediaProvider,
        string $routerRequestContextHost,
        ?string $assetsHost = null
    ) {
        $this->mediaProvider = $mediaProvider;
        $this->assetsHost = $assetsHost;
        $this->routerRequestContextHost = $routerRequestContextHost;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('media_public_url', [$this, 'getMediaUrl'])];
    }

    public function getMediaUrl(?Media $media, string $format): string
    {
        if (null === $media) {
            return '';
        }

        return $this->generatePublicUrlForProvider($media, $format);
    }

    private function generatePublicUrlForProvider(Media $media, string $format): string
    {
        return $this->assetsHost
            ? str_replace(
                $this->routerRequestContextHost,
                $this->assetsHost,
                $this->mediaProvider->generatePublicUrl($media, $format)
            )
            : $this->mediaProvider->generatePublicUrl($media, $format);
    }
}
