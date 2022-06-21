<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\SiteImage\Resolver;
use Capco\MediaBundle\Entity\Media;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Twig\Extension\RuntimeExtensionInterface;

class SiteImageRuntime implements RuntimeExtensionInterface
{
    protected Resolver $resolver;
    private SiteImageRepository $repository;
    private ContainerInterface $container;

    public function __construct(
        Resolver $resolver,
        SiteImageRepository $repository,
        ContainerInterface $container
    ) {
        $this->resolver = $resolver;
        $this->repository = $repository;
        $this->container = $container;
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

        $provider = $this->container->get($media->getProviderName());

        return $assetsHost
            ? str_replace(
                $routerRequestContextHost,
                $assetsHost,
                $provider->generatePublicUrl($media, 'default_logo')
            )
            : $provider->generatePublicUrl($media, 'default_logo');
    }

    public function getSiteImageMedia($key): ?Media
    {
        return $this->resolver->getMedia($key);
    }
}
