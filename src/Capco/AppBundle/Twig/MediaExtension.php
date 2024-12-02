<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Provider\MediaProvider;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class MediaExtension extends AbstractExtension
{
    public function __construct(private readonly MediaProvider $mediaProvider, private readonly string $routerRequestContextHost, private ?string $assetsHost = null)
    {
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('media_public_url', $this->getMediaUrl(...))];
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
