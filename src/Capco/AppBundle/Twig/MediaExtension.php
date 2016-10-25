<?php

namespace Capco\AppBundle\Twig;

use Symfony\Component\DependencyInjection\ContainerInterface;

class MediaExtension extends \Twig_Extension
{
    protected $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('media_public_url', [$this, 'getMediaUrl']),
        ];
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
