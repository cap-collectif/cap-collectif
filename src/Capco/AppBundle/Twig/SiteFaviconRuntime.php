<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\SiteImageRepository;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Twig\Extension\RuntimeExtensionInterface;

class SiteFaviconRuntime implements RuntimeExtensionInterface
{
    public function __construct(protected ContainerInterface $container, private readonly SiteImageRepository $repository, private readonly MediaProvider $provider)
    {
    }

    public function getSiteFavicons(): ?array
    {
        $mediaFavicon = $this->repository->getSiteFavicon();

        if (!$mediaFavicon) {
            return null;
        }

        $mediaFavicon = $mediaFavicon->getMedia();

        if (!$mediaFavicon) {
            return null;
        }

        $siteFavicon = [];

        foreach (
            [
                'favicon_16',
                'favicon_32',
                'favicon_36',
                'favicon_48',
                'favicon_57',
                'favicon_60',
                'favicon_70',
                'favicon_72',
                'favicon_76',
                'favicon_96',
                'favicon_114',
                'favicon_120',
                'favicon_144',
                'favicon_150',
                'favicon_152',
                'favicon_180',
                'favicon_192',
                'favicon_310',
            ]
            as $filter
        ) {
            $siteFavicon[$filter] = $this->provider->generatePublicUrl($mediaFavicon, $filter);
        }

        return $siteFavicon;
    }
}
