<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;

class AlphaProjectAdmin extends CapcoAdmin
{
    protected $baseRouteName = 'capco_admin_alpha_project';
    protected $baseRoutePattern = 'alpha/project';

    protected function configureListFields(ListMapper $list): void {}

    protected function configureFormFields(FormMapper $form): void
    {
        // Hack: We need at least one field to display the edit page.
        $form->add('id');
    }

    protected function configureDatagridFilters(DatagridMapper $filter): void {}

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->add('editAnalysis', $this->getRouterIdParameter() . '/analysis');
        $collection->add('editContributors', $this->getRouterIdParameter() . '/contributors');
        $collection->add('indexProposals', $this->getRouterIdParameter() . '/contributions');
        $collection->add(
            'editDebate',
            $this->getRouterIdParameter() . '/contributions/debate/{slug}'
        );
        $collection->add(
            'editProposals',
            $this->getRouterIdParameter() . '/contributions/proposals'
        );
        $collection->add(
            'editQuestionnaireReplies',
            $this->getRouterIdParameter() . '/contributions/questionnaire/{slug}'
        );
        $collection->add('editParticipants', $this->getRouterIdParameter() . '/participants');
        $collection->add(
            'createProposal',
            $this->getRouterIdParameter() . '/contributions/proposals/{stepId}/create'
        );

        $collection->clearExcept([
            'create',
            'edit',
            'editAnalysis',
            'indexProposals',
            'editDebate',
            'editContributors',
            'editProposals',
            'editParticipants',
            'createProposal',
            'editQuestionnaireReplies',
        ]);
    }
}
