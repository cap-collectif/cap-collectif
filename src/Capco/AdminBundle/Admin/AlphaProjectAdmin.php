<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Repository\ProjectRepository;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class AlphaProjectAdmin extends CapcoAdmin
{
    protected $baseRouteName = 'capco_admin_alpha_project';
    protected $baseRoutePattern = 'alpha/project';

    public function getObject($id)
    {
        return $this->getConfigurationPool()
            ->getContainer()
            ->get(ProjectRepository::class)
            ->find($id);
    }

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
        // Hack: We need at least one field to display the edit page.
        $formMapper->add('id');
    }

    protected function configureDatagridFilters(DatagridMapper $filterMapper): void
    {
    }

    protected function configureRoutes(RouteCollection $collection): void
    {
        $collection->add('editAnalysis', $this->getRouterIdParameter() . '/analysis');
        $collection->add('editContributors', $this->getRouterIdParameter() . '/contributors');
        $collection->add('indexProposals', $this->getRouterIdParameter() . '/contributions');
        $collection->add('editDebate', $this->getRouterIdParameter() . '/contributions/debate/{slug}');
        $collection->add('editProposals', $this->getRouterIdParameter() . '/contributions/proposals');
        $collection->add('editParticipants', $this->getRouterIdParameter() . '/participants');
        $collection->clearExcept([
            'create',
            'edit',
            'editAnalysis',
            'indexProposals',
            'editDebate',
            'editContributors',
            'editProposals',
            'editParticipants'
        ]);
    }
}
