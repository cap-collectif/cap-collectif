<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Capco\AppBundle\Entity\Theme;

class ThemeAdmin extends Admin
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
                'label' => 'admin.fields.theme.title',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.theme.position',
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
            ->add('events', null, array(
                'label' => 'admin.fields.theme.events',
            ))
            ->add('posts', null, array(
                'label' => 'admin.fields.theme.posts',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.theme.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.theme.updated_at',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.theme.author',
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
            ->add('Author', null, array(
                'label' => 'admin.fields.theme.author',
            ))
            ->add('status', null, array(
                'label' => 'admin.fields.theme.status',
                'template' => 'CapcoAdminBundle:Theme:status_list_field.html.twig',
                'statusesLabels' => Theme::$statusesLabels,
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.theme.position',
            ))
            ->add('ideasCount', null, array(
                'label' => 'admin.fields.theme.ideas_count',
                'template' => 'CapcoAdminBundle:Theme:ideas_count_list_field.html.twig',
            ))
            ->add('consultationsCount', null, array(
                'label' => 'admin.fields.theme.consultations_count',
                'template' => 'CapcoAdminBundle:Theme:consultations_count_list_field.html.twig',
            ))
            ->add('eventsCount', null, array(
                'label' => 'admin.fields.theme.events_count',
                'template' => 'CapcoAdminBundle:Theme:events_count_list_field.html.twig',
            ))
            ->add('postsCount', null, array(
                'label' => 'admin.fields.theme.posts_count',
                'template' => 'CapcoAdminBundle:Theme:posts_count_list_field.html.twig',
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
            ->add('title', null, array(
                'label' => 'admin.fields.theme.title',
                'required' => true,
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.theme.author',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.theme.is_enabled',
                'required' => false,
            ))
            ->add('position', 'integer', array(
                'label' => 'admin.fields.theme.position',
            ))
            ->add('teaser', 'textarea', array(
                'label' => 'admin.fields.theme.teaser',
                'required' => false,
            ))
            ->add('body', 'ckeditor', array(
                'label' => 'admin.fields.theme.body',
                'config_name' => 'admin_editor',
                'required' => false,
            ))
            ->add('status', 'choice', array(
                'label' => 'admin.fields.theme.status',
                'choices' => Theme::$statusesLabels,
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
                'empty_value' => 'admin.fields.theme.no_status',
            ))
            ->add('Media', 'sonata_type_model_list', array(
                'required' => false,
                'label' => 'admin.fields.theme.media',
            ), array(
                'link_parameters' => array(
                    'context' => 'default',
                    'hide_context' => true,
                    'provider' => 'sonata.media.provider.image',
                ),
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
            ->add('status', null, array(
                'label' => 'admin.fields.theme.status',
                'template' => 'CapcoAdminBundle:Theme:status_show_field.html.twig',
                'statusesLabels' => Theme::$statusesLabels,
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.theme.position',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.theme.author',
            ))
            ->add('Consultations', null, array(
                'label' => 'admin.fields.theme.consultations',
            ))
            ->add('Ideas', null, array(
                'label' => 'admin.fields.theme.ideas',
            ))
            ->add('events', null, array(
                'label' => 'admin.fields.theme.events',
            ))
            ->add('posts', null, array(
                'label' => 'admin.fields.theme.posts',
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

    public function getFeatures()
    {
        return array(
            'themes',
        );
    }
}
