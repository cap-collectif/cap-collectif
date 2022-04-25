<?php

namespace Capco\AdminBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class VarsExtension extends AbstractExtension
{
    /**
     * @return array
     */
    public function getFunctions()
    {
        return [new TwigFunction('json_decode', 'json_decode')];
    }
}
