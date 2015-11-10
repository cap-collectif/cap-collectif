<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class UserTypeAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'name',
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('name', null, array(
                'label' => 'admin.fields.user_type.name',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.user_type.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.user_type.updated_at',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('name', null, array(
                'label' => 'admin.fields.user_type.name',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.user_type.updated_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
                    'delete' => array(),
                ),
            ))
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('name', null, array(
                'label' => 'admin.fields.user_type.name',
            ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('name', null, array(
                'label' => 'admin.fields.user_type.name',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.user_type.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.user_type.updated_at',
            ))
        ;
    }

    public function getFeatures()
    {
        return array(
            'user_type',
        );
    }
}
