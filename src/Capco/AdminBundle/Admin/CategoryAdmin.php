<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class CategoryAdmin extends Admin
{
    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.category.title',
            ))
            ->add('Sources', null, array(
                'label' => 'admin.fields.category.sources',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.category.is_enabled',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.category.created_at',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, array(
                'label' => 'admin.fields.category.title',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.category.is_enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.category.updated_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
                    'delete' => array(),
                )
            ))
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', null, array(
                'label' => 'admin.fields.category.title',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.category.is_enabled',
            ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, array(
                'label' => 'admin.fields.category.title',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.category.is_enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.category.updated_at',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.category.created_at',
            ))
        ;
    }
}
