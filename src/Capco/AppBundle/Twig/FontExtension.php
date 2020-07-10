<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class FontExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('current_font', [FontRuntime::class, 'getCurrentFont']),
            new TwigFunction('active_custom_fonts', [FontRuntime::class, 'getCustomActiveFonts']),
            new TwigFunction('all_custom_fonts', [FontRuntime::class, 'getAllFonts']),
        ];
    }
}
