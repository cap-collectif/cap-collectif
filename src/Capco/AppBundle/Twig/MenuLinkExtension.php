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

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'menu_link';
    }

    public function getFunctions()
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
