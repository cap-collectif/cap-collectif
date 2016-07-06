<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class SelectionAdmin extends Admin
{
    protected $formOptions = [
        'cascade_validation' => true,
    ];

    protected $translationDomain = 'SonataAdminBundle';

    public function getPersistentParameters()
    {
        $subject = $this->getSubject();
        $projectId = null;
        $selectionStepId = null;

        if ($this->hasParentFieldDescription() && $this->getParentFieldDescription()->getAdmin()->getSubject() && $this->getParentFieldDescription()->getAdmin()->getSubject()->getId()) {
            $projectId = $this->getParentFieldDescription()->getAdmin()->getSubject()->getProjectId();
        } elseif ($subject && $subject->getProposal()) {
            $projectId = $subject->getProposal()->getProjectId();
        }

        if ($this->getRequest()->get('selectionStepId')) {
            $selectionStepId = $this->getRequest()->get('selectionStepId');
        } elseif ($subject && $subject->getSelectionStep() && !property_exists($subject->getSelectionStep(), '__isInitialized__')) {
            $selectionStepId = $subject->getSelectionStep()->getId();
        }

        if (!$projectId) {
            $projectId = $this->getRequest()->get('projectId');
        }

        return [
            'projectId' => $projectId,
            'selectionStepId' => $selectionStepId,
        ];
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $parentAdminCode = null;
        $parentFieldDescription = $this->getParentFieldDescription();
        if ($parentFieldDescription) {
            $parentAdminCode = $parentFieldDescription->getAdmin()->getCode();
        }

        if ($parentAdminCode !== 'capco_admin.admin.step') {
            $formMapper
                ->add('selectionStep', 'sonata_type_model', [
                    'required' => true,
                    'label' => 'admin.fields.selection.selection_step',
                    'translation_domain' => 'SonataAdminBundle',
                    'query' => $this->createQueryForSelectionSteps(
                        $this->getPersistentParameter('projectId')
                    ),
                    'btn_delete' => false,
                    'btn_add' => false,
                    'by_reference' => false,
                ])
            ;
        }

        $formMapper
            ->add('proposal', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.selection.proposal',
                'required' => true,
                'property' => 'title',
                'route' => [
                    'name' => 'capco_admin_proposals_autocomplete',
                    'parameters' => [
                        'projectId' => $this->getPersistentParameter('projectId'),
                        '_sonata_admin' => $this->getCode(),
                    ],
                ],
                'disabled' => $parentAdminCode === 'capco_admin.admin.proposal',
            ])
             ->add('status', 'sonata_type_model', [
                'required' => false,
                'label' => 'admin.fields.selection.status',
                'translation_domain' => 'SonataAdminBundle',
                'query' => $this->createQueryForStatuses(
                    $this->getPersistentParameter('selectionStepId')
                ),
                'btn_delete' => false,
                'btn_add' => false,
                'empty_value' => 'admin.fields.proposal.no_status',
            ])
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'delete', 'edit']);
    }

    private function createQueryForSelectionSteps($projectId = 0)
    {
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:Steps\SelectionStep')
            ->createQueryBuilder('ss')
            ->leftJoin('ss.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->andWhere('p.id = :projectId')
            ->setParameter('projectId', $projectId)
        ;

        return $qb->getQuery();
    }

    private function createQueryForStatuses($selectionStepId = null)
    {
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:Status')
            ->createQueryBuilder('s')
        ;

        if ($selectionStepId) {
            $qb
                ->leftJoin('s.step', 'step')
                ->andWhere('step.id = :stepId')
                ->setParameter('stepId', $selectionStepId)
            ;
        }

        return $qb->getQuery();
    }
}
