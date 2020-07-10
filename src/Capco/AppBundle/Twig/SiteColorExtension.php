<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class SiteColorExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'capco_site_color_value',
                [SiteColorRuntime::class, 'getSiteColorValue'],
                ['is_safe' => ['html']]
            ),
        ];
    }
}
