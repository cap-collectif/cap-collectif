<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\UserBundle\Admin\Model\UserAdmin as BaseAdmin;

class MapTokenAdmin extends BaseAdmin
{
    protected $baseRouteName = 'capco_admin_map_list';
    protected $baseRoutePattern = 'map';

    public function getTemplate($name)
    {
        if ('list' === $name) {
            return 'CapcoAdminBundle:Map:list.html.twig';
        }

        return parent::getTemplate($name);
    }

    protected function configureListFields(ListMapper $listMapper): void
    {
    }

    protected function configureDatagridFilters(DatagridMapper $filterMapper): void
    {
    }

    protected function configureRoutes(RouteCollection $collection): void
    {
        $collection->clearExcept(['list']);
    }
}
