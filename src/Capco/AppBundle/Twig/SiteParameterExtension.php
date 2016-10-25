<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteParameter\Resolver;

class SiteParameterExtension extends \Twig_Extension
{
    protected $resolver;

    public function __construct(Resolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('capco_site_parameter_value', [$this, 'getSiteParameterValue'], ['is_safe' => ['html']]),
       ];
    }

    public function getSiteParameterValue($key)
    {
        return $this->resolver->getValue($key);
    }
}
