<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Route\RouteCollection;

class FontAdmin extends AbstractAdmin
{
    protected $baseRouteName = 'capco_admin_site_font';
    protected $baseRoutePattern = 'font';

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list']);
    }
}
