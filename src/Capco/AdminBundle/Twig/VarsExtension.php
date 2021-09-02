<?php

namespace Capco\AdminBundle\Twig;

use Twig_Extension;

class VarsExtension extends Twig_Extension
{
    /**
     * @return array
     */
    public function getFunctions()
    {
        return [new \Twig_SimpleFunction('json_decode', 'json_decode')];
    }
}
