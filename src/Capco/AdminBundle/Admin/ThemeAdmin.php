<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class ThemeAdmin extends Admin
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
                'label' => 'admin.fields.theme.title',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.theme.is_enabled',
            ))
            ->add('Consultations', null, array(
                'label' => 'admin.fields.theme.consultations',
            ))
            ->add('Ideas', null, array(
                'label' => 'admin.fields.theme.ideas',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.theme.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.theme.updated_at',
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
                'label' => 'admin.fields.theme.title',
            ))
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.theme.is_enabled',
            ))
            ->add('updatedAt', 'datetime', array(
                'label' => 'admin.fields.theme.updated_at',
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
                'label' => 'admin.fields.theme.title',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.theme.is_enabled',
                'required' => false,
            ))
            ->add('teaser', 'textarea', array(
                'attr' => array('class' => 'ckeditor'),
                'label' => 'admin.fields.theme.teaser',
            ))
            ->add('body', 'textarea', array(
                'attr' => array('class' => 'ckeditor'),
                'label' => 'admin.fields.theme.body',
            ))
            ->add('Consultations', null, array(
                'label' => 'admin.fields.theme.consultations',
            ))
            ->add('Ideas', null, array(
                'label' => 'admin.fields.theme.ideas',
            ))
            ->add('Media', 'sonata_media_type', array(
                'provider' => 'sonata.media.provider.image',
                'context' => 'default',
                'label' => 'admin.fields.theme.media',
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
                'label' => 'admin.fields.theme.title',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.theme.is_enabled',
            ))
            ->add('teaser', null, array(
                'label' => 'admin.fields.theme.teaser',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.theme.body',
            ))
            ->add('Consultations', null, array(
                'label' => 'admin.fields.theme.consultations',
            ))
            ->add('Ideas', null, array(
                'label' => 'admin.fields.theme.ideas',
            ))
            ->add('Media', null, array(
                'template' => 'CapcoAdminBundle:Theme:media_show_field.html.twig',
                'label' => 'admin.fields.theme.media',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.theme.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.theme.updated_at',
            ))
        ;
    }
}
