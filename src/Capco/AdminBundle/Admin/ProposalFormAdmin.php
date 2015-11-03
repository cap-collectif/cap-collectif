<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Proposal;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class ProposalFormAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'createdAt',
    );

    protected $formOptions = array(
        'cascade_validation' => true
    );

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->with('admin.fields.proposal_form.group_general')
            ->add('title', null, [
                'label' => 'admin.fields.proposal_form.title',
            ])
            ->add('description', 'ckeditor', [
                'label'       => 'admin.fields.proposal_form.description',
                'config_name' => 'admin_editor',
            ])
            ->end()
        ;

        $formMapper
            ->with('admin.fields.proposal_form.group_questions')
            ->add('questions', 'sonata_type_collection', [
                'label'        => 'admin.fields.proposal_form.questions',
                'by_reference' => false,
                'required'     => false,
            ], [
                'edit'     => 'inline',
                'inline'   => 'table',
                'sortable' => 'position',
            ])
            ->end()
        ;
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.proposal_form.title',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal_form.updated_at',
            ])
        ;
    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.proposal_form.title',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal_form.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
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
                'label' => 'admin.fields.proposal_form.title',
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.proposal_form.enabled',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.proposal_form.updated_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal_form.updated_at',
            ])
        ;
    }
}
