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
            new \Twig_SimpleFunction(
                'capco_site_image_media',
                [$this, 'getSiteImageMedia'],
                ['is_safe' => ['html']]
            ),
            new \Twig_SimpleFunction(
                'app_logo_url',
                [$this, 'getAppLogourl'],
                ['is_safe' => ['html']]
            ),
        ];
    }

    public function getAppLogourl(): ?string
    {
        $logo = $this->repository->getAppLogo();

        if (!$logo) {
            return null;
        }

        $logo = $logo->getMedia();

        if (!$logo) {
            return null;
        }

        $provider = $this->container->get($logo->getProviderName());

        return $provider->generatePublicUrl($logo, 'default_logo');
    }

    public function getSiteImageMedia($key)
    {
        return $this->resolver->getMedia($key);
    }
}
