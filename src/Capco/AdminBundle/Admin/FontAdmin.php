<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Route\RouteCollectionInterface;

class FontAdmin extends AbstractAdmin
{
    protected $baseRouteName = 'capco_admin_site_font';
    protected $baseRoutePattern = 'font';

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['list']);
    }
}
