<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Manager\MenuItemResolver;

class MenuLinkExtension extends \Twig_Extension
{
    protected $resolver;

    public function __construct(MenuItemResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('menu_url', [$this, 'getMenuUrl']),
       ];
    }

    public function getMenuUrl($url)
    {
        return $this->resolver->getMenuUrl($url);
    }
}
