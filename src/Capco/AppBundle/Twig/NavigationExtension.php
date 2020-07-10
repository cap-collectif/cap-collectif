<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class NavigationExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [new TwigFunction('headers_list', [NavigationRuntime::class, 'getHeaders'])];
    }
}
