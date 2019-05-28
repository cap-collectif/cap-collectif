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

    public function getFilters(): array
    {
        return [
            new \Twig_SimpleFilter('usort', [$this, 'getUsort']),
            new \Twig_SimpleFilter('capco_url', [$this, 'getObjectUrl']),
            new \Twig_SimpleFilter('capco_admin_url', [$this, 'getAdminObjectUrl']),
        ];
    }

    public function getUsort(array $data, string $property = 'name')
    {
        usort($data, function ($data1, $data2) use ($property) {
            if ($data1->$property == $data2->$property) {
                return 0;
            }

            return $data1->$property < $data2->$property ? -1 : 1;
        });

        return $data;
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
