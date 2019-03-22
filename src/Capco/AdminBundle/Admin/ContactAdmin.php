<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\UserBundle\Admin\Model\UserAdmin as BaseAdmin;

class ContactAdmin extends BaseAdmin
{
    protected $baseRouteName = 'capco_admin_contact';
    protected $baseRoutePattern = 'contact';

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list']);
    }
}
