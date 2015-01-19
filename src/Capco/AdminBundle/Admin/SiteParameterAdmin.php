<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

use Sonata\AdminBundle\Route\RouteCollection;

class SiteParameterAdmin extends Admin
{

    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'title'
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.site_parameter.title',
            ))
            ->add('value', null, array(
                'label' => 'admin.fields.site_parameter.value',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.site_parameter.is_enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.site_parameter.updated_at',
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
                'label' => 'admin.fields.site_parameter.title',
            ))
            ->add('value', null, array(
                'label' => 'admin.fields.site_parameter.value',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.site_parameter.is_enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.site_parameter.updated_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
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
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.site_parameter.is_enabled',
                'required' => false,
            ))
            ->add('value', null, array(
                'label' => 'admin.fields.site_parameter.value',
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
                'label' => 'admin.fields.site_parameter.title',
            ))
            ->add('value', null, array(
                'label' => 'admin.fields.site_parameter.value',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.site_parameter.is_enabled',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.site_parameter.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.site_parameter.updated_at',
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
        $collection->remove('delete');
    }
}
