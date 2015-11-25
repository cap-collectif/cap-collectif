<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\UrlResolver;

class UrlExtension extends \Twig_Extension
{
    protected $urlResolver;

    public function __construct(UrlResolver $urlResolver)
    {
        $this->urlResolver = $urlResolver;
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'capco_url';
    }

    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('capco_url', [$this, 'getObjectUrl']),
            new \Twig_SimpleFilter('capco_admin_url', [$this, 'getAdminObjectUrl']),
        ];
    }

    public function getObjectUrl($object, $absolute = false)
    {
        return $this->urlResolver->getObjectUrl($object, $absolute);
    }

    public function getAdminObjectUrl($object, $absolute = false)
    {
        return $this->urlResolver->getAdminObjectUrl($object, $absolute);
    }
}
