<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class ThemeExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [new TwigFunction('themes_list', [ThemeRuntime::class, 'listThemes'])];
    }
}
