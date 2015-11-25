<?php

namespace Capco\AppBundle\Twig;

use Symfony\Component\Routing\Router;
use Symfony\Component\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints\Url;

class MenuLinkExtension extends \Twig_Extension
{
    protected $router;
    protected $validator;

    public function __construct(Router $router, ValidatorInterface $validator)
    {
        $this->router = $router;
        $this->validator = $validator;
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
        if ('/' === $url) {
            return $this->router->generate('app_homepage');
        }

        $constraint = new Url();
        $errorList = $this->validator->validate(
            $url,
            $constraint
        );

        if (count($errorList) == 0) {
            return $url;
        }

        return $this->router->generate('capco_app_cms', ['url' => $url]);
    }
}
