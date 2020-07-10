<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class MapTokensExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'capco_map_tokens',
                [MapTokensRuntime::class, 'getMapTokens'],
                ['is_safe' => 'html']
            ),
        ];
    }
}
