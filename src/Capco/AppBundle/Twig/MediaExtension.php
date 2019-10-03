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
        $routerRequestContextHost = $this->container->getParameter('router.request_context.host');
        $assetsHost = $this->container->getParameter('assets_host');
        $provider = $this->container->get($media->getProviderName());

        return $assetsHost ?
            str_replace(
                $routerRequestContextHost,
                $assetsHost,
                $provider->generatePublicUrl($media, $format)
            ) :
            $provider->generatePublicUrl($media, $format);
    }
}
