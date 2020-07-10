<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Manager\MenuItemResolver;
use Twig\Extension\RuntimeExtensionInterface;

class NavigationRuntime implements RuntimeExtensionInterface
{
    protected $menuResolver;

    public function __construct(MenuItemResolver $menuResolver)
    {
        $this->menuResolver = $menuResolver;
    }

    public function getHeaders($currentUrl = null): array
    {
        return $this->menuResolver->getEnabledMenuItemsWithChildren(
            MenuItem::TYPE_HEADER,
            $currentUrl
        );
    }
}
