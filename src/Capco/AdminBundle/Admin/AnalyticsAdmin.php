<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Route\RouteCollection;

class AnalyticsAdmin extends AbstractAdmin
{
    protected $baseRouteName = 'capco_admin_analytics';
    protected $baseRoutePattern = 'capco/analytics';

    protected function configureRoutes(RouteCollection $collection): void
    {
        $collection->clearExcept(['list']);
    }
}
