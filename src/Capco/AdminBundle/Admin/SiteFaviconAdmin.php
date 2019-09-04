<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\UserBundle\Admin\Model\UserAdmin as BaseAdmin;

class SiteFaviconAdmin extends BaseAdmin
{
    protected $baseRouteName = 'capco_admin_site_favicon';
    protected $baseRoutePattern = 'favicon';

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list']);
    }
}
