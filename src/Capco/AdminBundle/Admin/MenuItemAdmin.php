<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class MenuItemAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by'    => 'Menu',
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('Menu')
            ->add('title')
            ->add('isEnabled')
            ->add('createdAt')
            ->add('updatedAt')
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('title')
            ->add('Menu')
            ->add('isEnabled', null, array('editable' => true))
            ->add('position')
            ->add('updatedAt')
            ->add('_action', 'actions', array(
                'actions' => array(
                    'edit' => array('template' => 'CapcoAdminBundle:MenuItem:list__action_edit.html.twig'),
                    'delete' => array('template' => 'CapcoAdminBundle:MenuItem:list__action_delete.html.twig'),
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
            ->add('Menu')
            ->add('title')
            ->add('link')
            ->add('isEnabled')
            ->add('position')
        ;
    }
}
