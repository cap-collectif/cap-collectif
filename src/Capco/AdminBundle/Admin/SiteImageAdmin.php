<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class SiteImageAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.site_image.title',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.site_image.is_enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.site_image.updated_at',
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
                'label' => 'admin.fields.site_image.title',
            ))
            ->add('Media', 'sonata_media_type', array(
                'label' => 'admin.fields.site_image.media',
                'template' => 'CapcoAdminBundle:SiteImage:media_list_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'context' => 'default',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.site_image.is_enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.site_image.updated_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
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
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.site_image.is_enabled',
                'required' => false,
            ))
            ->add('Media', 'sonata_type_model_list', array(
                'required' => false,
                'label' => 'admin.fields.site_image.media',
            ), array(
                'link_parameters' => array(
                    'context' => 'default',
                    'hide_context' => true,
                    'provider' => 'sonata.media.provider.image',
            ), ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, array(
                'label' => 'admin.fields.site_image.title',
            ))
            ->add('Media', 'sonata_media_type', array(
                'label' => 'admin.fields.site_image.media',
                'template' => 'CapcoAdminBundle:SiteImage:media_show_field.html.twig',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.site_image.is_enabled',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.site_image.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.site_image.updated_at',
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
        $collection->remove('delete');
    }
}
