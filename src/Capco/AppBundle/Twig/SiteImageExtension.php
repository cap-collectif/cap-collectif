<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class SiteImageExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'capco_site_image_media',
                [SiteImageRuntime::class, 'getSiteImageMedia'],
                ['is_safe' => ['html']]
            ),
            new TwigFunction(
                'app_logo_url',
                [SiteImageRuntime::class, 'getAppLogoUrl'],
                ['is_safe' => ['html']]
            ),
        ];
    }
}
