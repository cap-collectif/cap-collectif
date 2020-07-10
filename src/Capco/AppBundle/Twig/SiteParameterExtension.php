<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class SiteParameterExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'capco_site_parameter_value',
                [SiteParameterRuntime::class, 'getSiteParameterValue'],
                ['is_safe' => ['html']]
            ),
        ];
    }
}
