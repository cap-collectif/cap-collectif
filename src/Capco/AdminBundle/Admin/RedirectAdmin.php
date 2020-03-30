<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\UserBundle\Admin\Model\UserAdmin as BaseAdmin;

class RedirectAdmin extends BaseAdmin
{
    protected $baseRouteName = 'capco_admin_redirect';
    protected $baseRoutePattern = 'redirect';

    public function getFeatures(): array
    {
        return ['http_redirects'];
    }

    public function getTemplate($name): ?string
    {
        if ('list' === $name) {
            return 'CapcoAdminBundle:Redirect:list.html.twig';
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
