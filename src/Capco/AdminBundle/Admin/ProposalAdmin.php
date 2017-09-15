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
            ->add('id', null, [
                'label' => 'admin.fields.proposal.id',
            ])
            ->add('titleInfo', null, [
                'label' => 'admin.fields.proposal.title',
                'template' => 'CapcoAdminBundle:Proposal:title_list_field.html.twig',
            ])
            ->add('author', 'sonata_type_model', [
                'label' => 'admin.fields.proposal.author',
                'template' => 'CapcoAdminBundle:common:author_list_field.html.twig',
            ])
            ->add('project', 'sonata_type_model', [
                'label' => 'admin.fields.proposal.project',
                'template' => 'CapcoAdminBundle:Proposal:project_list_field.html.twig',
            ])
            ->add('category', 'sonata_type_model', [
                'label' => 'admin.fields.proposal.category',
            ])
            ->add('district', 'sonata_type_model', [
                'label' => 'admin.fields.proposal.district',
            ])
            ->add('lastStatus', null, [
                'label' => 'admin.fields.proposal.last_status',
                'template' => 'CapcoAdminBundle:Proposal:last_status_list_field.html.twig',
            ])
            ->add('isTrashed', null, [
                'editable' => true,
                'label' => 'admin.fields.proposal.isTrashed',
            ]);

        if ($currentUser->hasRole('ROLE_SUPER_ADMIN')) {
            $listMapper->add('deletedAt', null, [
                'label' => 'admin.fields.proposal.deleted',
            ]);
        }

        $listMapper
            ->add('updatedInfo', 'datetime', [
                'label' => 'admin.fields.proposal.updated_at',
                'template' => 'CapcoAdminBundle:common:updated_info_list_field.html.twig',
            ]);
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
            ->add('author', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.proposal.author',
            ], null, [
                'property' => 'username',
            ])
            ->add('likers', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.proposal.likers',
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
        $datagridMapper
            ->add('status', null, [
                'label' => 'admin.fields.proposal.status',
            ])
            ->add('estimation', null, [
                'label' => 'admin.fields.proposal.estimation',
            ])
            ->add('proposalForm.step.projectAbstractStep.project', null, [
                'label' => 'admin.fields.proposal.project',
            ])
            ->add('expired', null, ['label' => 'admin.global.expired']);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list', 'edit']);
    }
}
