<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Proposal;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class ProposalAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'createAt',
    );

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->with('admin.fields.proposal.group_content')
            ->add('title', null, [
                'label' => 'admin.fields.proposal.title',
                'read_only' => true,
                'disabled' => true,
            ])
            ->add('body', 'ckeditor', [
                'label' => 'admin.fields.proposal.body',
                'config_name' => 'admin_editor',
                'read_only' => true,
                'disabled' => true,
            ])
            ->add('author', null, [
                'label' => 'admin.fields.proposal.author',
                'required' => true,
                'read_only' => true,
                'disabled' => true,
            ])
            ->add('rating', 'choice', [
                'label' => 'admin.fields.proposal.rating',
                'required' => false,
                'choices' => Proposal::$ratings,
                'help' => 'admin.fields.proposal.help.rating',
            ])
            ->add('annotation', 'ckeditor', [
                'label' => 'admin.fields.proposal.annotation',
                'required' => false,
                'help' => 'admin.fields.proposal.help.annotation',
            ])
            ->end()

            ->with('admin.fields.proposal.group_publication')
                ->add('enabled', null, [
                    'label' => 'admin.fields.proposal.enabled',
                    'required' => false,
                ])
                ->add('isTrashed', null, [
                    'label' => 'admin.fields.proposal.isTrashed',
                    'required' => false,
                ])
                ->add('trashedReason', null, [
                    'label' => 'admin.fields.proposal.trashedReason',
                    'required' => false,
                ])
            ->end()
        ;
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.proposal.title',
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.proposal.enabled',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal.updated_at',
            ])
        ;
    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.proposal.title',
            ])
            ->add('enabled', null, [
                'editable' => true,
                'label' => 'admin.fields.proposal.enabled',
            ])
            ->add('isTrashed', null, [
                'editable' => true,
                'label'    => 'admin.fields.proposal.isTrashed',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                ],
            ])
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.proposal.title',
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.proposal.enabled',
            ])
            ->add('body', null, [
                'label' => 'admin.fields.proposal.body',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal.updated_at',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.proposal.created_at',
            ])
        ;
    }
}
