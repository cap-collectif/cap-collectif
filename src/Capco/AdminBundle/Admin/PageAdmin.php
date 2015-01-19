<?php
// src/Acme/DemoBundle/Admin/PostAdmin.php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class PageAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'title'
    );

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', null, array(
                'label' => 'admin.fields.page.title',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.page.body',
                'attr' => array('class' => 'ckeditor'),
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.page.is_enabled',
                'required' => false,
            ))
        ;
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.page.title',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.page.is_enabled',
            ))
            ->add('MenuItems', null, array(
                'label' => 'admin.fields.page.menu_items',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.page.updated_at',
            ))
        ;
    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, array(
                'label' => 'admin.fields.page.title',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.page.is_enabled',
            ))
            ->add('MenuItems', null, array(
                'label' => 'admin.fields.page.menu_items',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.page.updated_at',
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
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, array(
                'label' => 'admin.fields.page.title',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.page.is_enabled',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.page.body',
            ))
            ->add('URL', null, array(
                'template' => 'CapcoAdminBundle:Page:url_show_field.html.twig',
                'label' => 'admin.fields.page.url',
            ))
            ->add('MenuItems', null, array(
                'label' => 'admin.fields.page.menu_items',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.page.updated_at',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.page.created_at',
            ))
        ;
    }
}
