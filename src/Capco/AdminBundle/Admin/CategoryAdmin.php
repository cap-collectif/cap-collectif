<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class CategoryAdmin extends AbstractAdmin
{
    protected $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'title'];

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, ['label' => 'admin.fields.category.title'])
            ->add('sources', null, ['label' => 'admin.fields.category.sources'])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.category.is_enabled',
            ])
            ->add('createdAt', null, ['label' => 'admin.fields.category.created_at']);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, ['label' => 'admin.fields.category.title'])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.category.is_enabled',
            ])
            ->add('updatedAt', null, ['label' => 'admin.fields.category.updated_at'])
            ->add('_action', 'actions', [
                'actions' => ['show' => [], 'edit' => [], 'delete' => []],
            ]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', null, ['label' => 'admin.fields.category.title'])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.category.is_enabled',
                'required' => false,
            ]);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, ['label' => 'admin.fields.category.title'])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.category.is_enabled',
            ])
            ->add('updatedAt', null, ['label' => 'admin.fields.category.updated_at'])
            ->add('createdAt', null, ['label' => 'admin.fields.category.created_at']);
    }
}
