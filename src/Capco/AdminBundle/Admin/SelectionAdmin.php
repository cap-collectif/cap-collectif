<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Admin\AdminInterface;
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

        if ($subject && $subject->getSelectionStep()) {
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
                'required' => false,
                'property' => 'title',
                'callback' => function ($admin, $property, $value) {
                    $this->createQueryForProposals(
                        $admin,
                        $property,
                        $value,
                        $this->getPersistentParameter('projectId')
                    );
                },
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

    private function createQueryForProposals(AdminInterface $admin, $property, $value, $projectId = 0)
    {
        $datagrid = $admin->getDatagrid();
        $qb = $datagrid->getQuery();
        $usedProposals = null;
        if ((!$this->getSubject() || !$this->getSubject()->getId()) && $this->hasParentFieldDescription() && $parentObject = $this->getParentFieldDescription()->getAdmin()->getSubject()) {
            if ($parentObject instanceof SelectionStep) {
                $usedProposals = $parentObject->getProposalsId();
            }
        }

        if ($projectId) {
            $qb
                ->leftJoin('p.proposalForm', 'pf')
                ->leftJoin('pf.step', 's')
                ->leftJoin('s.projectAbstractStep', 'pas')
                ->leftJoin('pas.project', 'p')
                ->andWhere('p.id = :projectId')
                ->setParameter('projectId', $projectId)
            ;
        }
        if ($usedProposals) {
            $qb->andWhere('p.id NOT IN (:usedProposals)')
                ->setParameter('usedProposals', $usedProposals)
            ;
        }

        $datagrid->setValue($property, null, $value);
    }

    private function createQueryForStatuses($selectionStepId = 0)
    {
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:Status')
            ->createQueryBuilder('s')
            ->leftJoin('s.step', 'step')
            ->andWhere('step.id = :stepId')
            ->setParameter('stepId', $selectionStepId)
        ;

        return $qb->getQuery();
    }
}
