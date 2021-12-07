<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Security\ProjectVoter;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AlphaProjectAdmin extends CapcoAdmin
{
    protected $baseRouteName = 'capco_admin_alpha_project';
    protected $baseRoutePattern = 'alpha/project';
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        $code,
        $class,
        $baseControllerName,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->authorizationChecker = $authorizationChecker;
    }

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

    public function isGranted($name, $object = null)
    {
        return $this->authorizationChecker->isGranted(ProjectVoter::VIEW, $object);
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
