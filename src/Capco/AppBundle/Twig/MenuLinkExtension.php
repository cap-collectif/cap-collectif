<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Manager\MenuItemResolver;
use Symfony\Component\Routing\Router;
use Capco\AppBundle\Entity\MenuItem;

class MenuLinkExtension extends \Twig_Extension
{
    protected $resolver;
    protected $router;

    public function __construct(MenuItemResolver $resolver, Router $router)
    {
        $this->resolver = $resolver;
        $this->router = $router;
    }

    public function getFunctions(): array
    {
        return [new \Twig_SimpleFunction('menu_url', [$this, 'getMenuUrl'])];
    }

    public function getMenuUrl(MenuItem $item): string
    {
        if ($item->getPage()) {
            return $this->router->generate('app_page_show', [
                'slug' => $item->getPage()->getSlug(),
            ]);
        }

        return $this->resolver->getMenuUrl($item->getLink());
    }
}
