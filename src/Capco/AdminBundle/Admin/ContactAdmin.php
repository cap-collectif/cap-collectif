<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Route\RouteCollection;

class ContactAdmin extends AbstractAdmin
{
    protected $baseRouteName = 'capco_admin_contact';
    protected $baseRoutePattern = 'contact';

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list']);
    }
}
