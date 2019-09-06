<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Route\RouteCollection;

class SiteFaviconAdmin extends SiteImageAdmin
{
    protected $baseRouteName = 'capco_admin_site_favicon';
    protected $baseRoutePattern = 'favicon';

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list']);
    }
}
