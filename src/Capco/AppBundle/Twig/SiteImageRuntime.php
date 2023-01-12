<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\SiteImage\Resolver;
use Capco\MediaBundle\Entity\Media;
use Capco\MediaBundle\Provider\MediaProvider;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Twig\Extension\RuntimeExtensionInterface;

class SiteImageRuntime implements RuntimeExtensionInterface
{
    protected Resolver $resolver;
    private SiteImageRepository $repository;
    private ContainerInterface $container;
    private MediaProvider $mediaProvider;

    public function __construct(
        Resolver $resolver,
        SiteImageRepository $repository,
        ContainerInterface $container,
        MediaProvider $mediaProvider
    ) {
        $this->resolver = $resolver;
        $this->repository = $repository;
        $this->container = $container;
        $this->mediaProvider = $mediaProvider;
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
