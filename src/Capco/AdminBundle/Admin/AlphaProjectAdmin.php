<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\UserBundle\Admin\Model\UserAdmin as BaseAdmin;

class AlphaProjectAdmin extends BaseAdmin
{
    protected $baseRouteName = 'capco_admin_alpha_project';
    protected $baseRoutePattern = 'alpha/project';

    public function getTemplate($name)
    {
        if ('edit' === $name) {
            return 'CapcoAdminBundle:AlphaProject:create.html.twig';
        }

        return parent::getTemplate($name);
    }

    protected function configureListFields(ListMapper $listMapper): void
    {
    }

    protected function configureFormFields(FormMapper $formMapper): void
    {
        $formMapper->add('id');
    }

    protected function configureDatagridFilters(DatagridMapper $filterMapper): void
    {
    }

    protected function configureRoutes(RouteCollection $collection): void
    {
        $collection->clearExcept(['create', 'edit']);
    }
}
