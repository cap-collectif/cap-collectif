<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\SiteImage\Resolver;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Twig\Extension\RuntimeExtensionInterface;

class SiteImageRuntime implements RuntimeExtensionInterface
{
    public function __construct(
        protected Resolver $resolver,
        private readonly SiteImageRepository $repository,
        private readonly ContainerInterface $container,
        private readonly MediaProvider $mediaProvider
    ) {
    }

    public function getAppLogoUrl(): ?string
    {
        $logo = $this->repository->getAppLogo();

        if (!$logo) {
            return null;
        }

        $media = $logo->getMedia();

        if (!$media) {
            return null;
        }

        $routerRequestContextHost = $this->container->getParameter('router.request_context.host');
        $assetsHost = $this->container->getParameter('assets_host');

        return $assetsHost
            ? str_replace(
                $routerRequestContextHost,
                $assetsHost,
                $this->mediaProvider->generatePublicUrl($media, 'default_logo')
            )
            : $this->mediaProvider->generatePublicUrl($media, 'default_logo');
    }

    public function getSiteImageMedia($key): ?Media
    {
        return $this->resolver->getMedia($key);
    }
}
