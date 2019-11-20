<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Manager\MenuItemResolver;
use Symfony\Component\Routing\RouterInterface;
use Capco\AppBundle\Entity\MenuItem;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class MenuLinkExtension extends AbstractExtension
{
    protected $resolver;
    protected $router;

    public function __construct(MenuItemResolver $resolver, RouterInterface $router)
    {
        $this->resolver = $resolver;
        $this->router = $router;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('menu_url', [$this, 'getMenuUrl'])];
    }

    public function getMenuUrl(MenuItem $item): string
    {
        return $this->resolver->getMenuUrl($item);
    }
}
