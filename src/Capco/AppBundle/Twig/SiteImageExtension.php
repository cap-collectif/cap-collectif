<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\SiteImage\Resolver;
use Capco\MediaBundle\Entity\Media;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class SiteImageExtension extends AbstractExtension
{
    protected $resolver;
    private $repository;
    private $container;

    public function __construct(
        Resolver $resolver,
        SiteImageRepository $repository,
        ContainerInterface $container
    ) {
        $this->resolver = $resolver;
        $this->repository = $repository;
        $this->container = $container;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'capco_site_image_media',
                [$this, 'getSiteImageMedia'],
                ['is_safe' => ['html']]
            ),
            new TwigFunction('app_logo_url', [$this, 'getAppLogoUrl'], ['is_safe' => ['html']])
        ];
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

        return $assetsHost ?
            str_replace(
                $routerRequestContextHost,
                $assetsHost,
                $provider->generatePublicUrl($media, 'default_logo')
            ) :
            $provider->generatePublicUrl($media, 'default_logo');
    }

    public function getSiteImageMedia($key): ?Media
    {
        return $this->resolver->getMedia($key);
    }
}
