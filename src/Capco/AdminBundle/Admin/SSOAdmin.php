<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\UserBundle\Admin\Model\UserAdmin as BaseAdmin;

class SSOAdmin extends BaseAdmin
{
    protected $baseRouteName = 'capco_admin_sso';
    protected $baseRoutePattern = 'sso';

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list']);
    }
}
