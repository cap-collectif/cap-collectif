<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Route\RouteCollectionInterface;

class ContactAdmin extends AbstractAdmin
{
    protected $baseRouteName = 'capco_admin_contact';
    protected $baseRoutePattern = 'contact';

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['list']);
    }
}
