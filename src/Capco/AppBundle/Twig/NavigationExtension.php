<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Manager\MenuItemResolver;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class NavigationExtension extends AbstractExtension
{
    protected $menuResolver;

    public function __construct(MenuItemResolver $menuResolver)
    {
        $this->menuResolver = $menuResolver;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('headers_list', [$this, 'getHeaders'])];
    }

    public function getHeaders($currentUrl = null): array
    {
        return $this->menuResolver->getEnabledMenuItemsWithChildren(
            MenuItem::TYPE_HEADER,
            $currentUrl
        );
    }
}
