<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class MenuLinkExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [new TwigFunction('menu_url', [MenuLinkRuntime::class, 'getMenuUrl'])];
    }
}
