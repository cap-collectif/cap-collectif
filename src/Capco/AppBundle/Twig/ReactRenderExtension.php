<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class ReactRenderExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'react_render_component',
                [ReactRenderRuntime::class, 'reactRenderIntlComponent'],
                ['is_safe' => ['html']]
            ),
        ];
    }
}
