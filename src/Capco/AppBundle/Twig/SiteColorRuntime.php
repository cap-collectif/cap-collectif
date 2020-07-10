<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteColor\Resolver;
use Twig\Extension\RuntimeExtensionInterface;

class SiteColorRuntime implements RuntimeExtensionInterface
{
    protected $resolver;

    public function __construct(Resolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getSiteColorValue($key)
    {
        return $this->resolver->getValue($key);
    }
}
