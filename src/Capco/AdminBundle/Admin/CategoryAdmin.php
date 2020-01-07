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
            ->add('title', null, ['label' => 'global.title'])
            ->add('sources', null, ['label' => 'global.sources.label'])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'global.published',
            ])
            ->add('createdAt', null, ['label' => 'global.creation']);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, ['label' => 'global.title'])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'global.published',
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'actions' => ['show' => [], 'edit' => [], 'delete' => []],
            ]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', null, ['label' => 'global.title'])
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'required' => false,
            ]);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, ['label' => 'global.title'])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'global.published',
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('createdAt', null, ['label' => 'global.creation']);
    }
}
