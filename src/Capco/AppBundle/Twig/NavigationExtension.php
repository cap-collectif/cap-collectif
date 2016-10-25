<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Manager\MenuItemResolver;
use Capco\AppBundle\Entity\MenuItem;

class NavigationExtension extends \Twig_Extension
{
    protected $menuResolver;

    public function __construct(MenuItemResolver $menuResolver)
    {
        $this->menuResolver = $menuResolver;
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('headers_list', [$this, 'getHeaders']),
       ];
    }

    public function getHeaders($currentUrl = null)
    {
        return $this->menuResolver->getEnabledMenuItemsWithChildren(MenuItem::TYPE_HEADER, $currentUrl);
    }
}
