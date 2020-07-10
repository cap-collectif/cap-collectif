<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class SiteFaviconExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [new TwigFunction('site_favicons', [SiteFaviconRuntime::class, 'getSiteFavicons'])];
    }
}
