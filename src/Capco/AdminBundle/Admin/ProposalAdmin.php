<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Proposal;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class ProposalAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'DESC',
        '_sort_by' => 'updatedAt',
    ];

    public function getList()
    {
        // Remove APC Cache for soft delete
        $em = $this->getConfigurationPool()->getContainer()->get('doctrine')->getManager();
        $em->getConfiguration()->getResultCacheImpl()->deleteAll();

        return parent::getList();
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);
        $currentUser = $this->getConfigurationPool()->getContainer()->get('security.token_storage')->getToken()->getUser();

        $listMapper
            ->addIdentifier('id', null, [
                'label' => 'admin.fields.proposal.id',
            ])
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.proposal.title',
            ])
            ->add('enabled', null, [
                'editable' => true,
                'label' => 'admin.fields.proposal.enabled',
            ])
            ->add('isTrashed', null, [
                'editable' => true,
                'label' => 'admin.fields.proposal.isTrashed',
            ])
            ->add('updateAuthor', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.proposal.updateAuthor',
                'property' => 'username',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal.updated_at',
            ]);
        if ($currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $listMapper->add('deletedAt', null, [
                'label' => 'admin.fields.proposal.deleted',
            ]);
        }
        $listMapper->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                ],
            ])
        ;
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $currentUser = $this->getConfigurationPool()->getContainer()->get('security.token_storage')->getToken()->getUser();

        $datagridMapper
            ->add('id', null, [
                'label' => 'admin.fields.proposal.id',
            ])
            ->add('title', null, [
                'label' => 'admin.fields.proposal.title',
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.proposal.enabled',
            ])
            ->add('isTrashed', null, [
                'label' => 'admin.fields.proposal.isTrashed',
            ])
            ->add('updateAuthor', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.proposal.updateAuthor',
            ], null, [
                'property' => 'username',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal.updated_at',
            ]);
        if ($currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $datagridMapper->add('deletedAt', null, [
                    'label' => 'admin.fields.proposal.deleted',
                ]);
        }
        $datagridMapper->add('status', null, [
                'label' => 'admin.fields.proposal.status',
            ])
            ->add('estimation', null, [
                'label' => 'admin.fields.proposal.estimation',
            ])
            ->add('proposalForm.step', null, [
                'label' => 'admin.fields.proposal.collect_step',
            ])
            ->add('proposalForm.step.projectAbstractStep.project', null, [
                'label' => 'admin.fields.proposal.project',
            ])
            ->add('expired', null, ['label' => 'admin.global.expired'])
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list', 'edit']);
    }
}
