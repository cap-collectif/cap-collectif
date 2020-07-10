<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Manager\MenuItemResolver;
use Symfony\Component\Routing\RouterInterface;
use Twig\Extension\RuntimeExtensionInterface;

class MenuLinkRuntime implements RuntimeExtensionInterface
{
    protected $resolver;
    protected $router;

    public function __construct(MenuItemResolver $resolver, RouterInterface $router)
    {
        $this->resolver = $resolver;
        $this->router = $router;
    }

    public function getMenuUrl(MenuItem $item): string
    {
        return $this->resolver->getMenuUrl($item);
    }
}
