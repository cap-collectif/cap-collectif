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

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'site_parameter';
    }

    public function getFunctions()
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
