<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\SiteImageRepository;
use Symfony\Component\DependencyInjection\ContainerInterface;

class SiteFaviconExtension extends \Twig_Extension
{
    protected $container;
    private $repository;

    public function __construct(ContainerInterface $container, SiteImageRepository $repository)
    {
        $this->container = $container;
        $this->repository = $repository;
    }

    public function getFunctions(): array
    {
        return [new \Twig_SimpleFunction('site_favicon', [$this, 'getSiteFavicon'])];
    }

    public function getSiteFavicon(): ?array
    {
        $mediaFavicon = $this->repository->getSiteFavicon()->getMedia();

        if (!$mediaFavicon) {
            return null;
        }

        $provider = $this->container->get($mediaFavicon->getProviderName());
        $siteFavicon = [];

        foreach (
            [
                'favicon_16',
                'favicon_32',
                'favicon_57',
                'favicon_60',
                'favicon_72',
                'favicon_76',
                'favicon_96',
                'favicon_114',
                'favicon_120',
                'favicon_144',
                'favicon_152',
                'favicon_180',
            ]
            as $filter
        ) {
            $siteFavicon[$filter] = $provider->generatePublicUrl($mediaFavicon, $filter);
        }

        return $siteFavicon;
    }
}
