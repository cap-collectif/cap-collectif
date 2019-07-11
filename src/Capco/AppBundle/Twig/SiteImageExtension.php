<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\SiteImage\Resolver;
use Symfony\Component\DependencyInjection\ContainerInterface;

class SiteImageExtension extends \Twig_Extension
{
    protected $resolver;
    private $repository;
    private $container;
    private $kernelEnvironment;

    public function __construct(
        Resolver $resolver,
        SiteImageRepository $repository,
        ContainerInterface $container,
        string $kernelEnvironment
    ) {
        $this->resolver = $resolver;
        $this->repository = $repository;
        $this->container = $container;
        $this->kernelEnvironment = $kernelEnvironment;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction(
                'capco_site_image_media',
                [$this, 'getSiteImageMedia'],
                ['is_safe' => ['html']]
            ),
            new \Twig_SimpleFunction(
                'app_logo_url',
                [$this, 'getAppLogoUrl'],
                ['is_safe' => ['html']]
            )
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

        $provider = $this->container->get($media->getProviderName());

        return $provider->generatePublicUrl($media, 'default_logo');
    }

    public function getSiteImageMedia($key)
    {
        return $this->resolver->getMedia($key);
    }
}
