<?php

namespace Capco\AppBundle\Twig;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class MediaExtension extends AbstractExtension
{
    protected $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('media_public_url', [$this, 'getMediaUrl'])];
    }

    public function getMediaUrl($media, $format)
    {
        if (!$media) {
            return;
        }

        $provider = $this->container->get($media->getProviderName());

        return $provider->generatePublicUrl($media, $format);
    }
}
