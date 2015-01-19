<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

use Capco\AppBundle\Entity\OpinionType;

class OpinionTypeAdmin extends Admin
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
                'label' => 'admin.fields.opinion_type.title',
            ))
            ->add('shortName', null, array(
                'label' => 'admin.fields.opinion_type.short_name',
            ))
            ->add('voteWidgetType', null, array(
                'label' => 'admin.fields.opinion_type.vote_widget_type',
            ))
            ->add('color', null, array(
                'label' => 'admin.fields.opinion_type.color',
            ))
            ->add('Opinions', null, array(
                'label' => 'admin.fields.opinion_type.opinions',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.opinion_type.is_enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.opinion_type.updated_at',
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
                'label' => 'admin.fields.opinion_type.title',
            ))
            ->addIdentifier('shortName', null, array(
                'label' => 'admin.fields.opinion_type.short_name',
            ))
            ->add('color', null, array(
                'label' => 'admin.fields.opinion_type.color',
                'template' => 'CapcoAdminBundle:OpinionType:color_list_field.html.twig',
                'typesColors' => OpinionType::$colorsType,
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.opinion_type.is_enabled',
                'editable' => true,
            ))
            ->add('updatedAt', 'datetime', array(
                'label' => 'admin.fields.opinion_type.updated_at',
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
                'label' => 'admin.fields.opinion_type.title',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.opinion_type.is_enabled',
                'required' => false,
            ))
            ->add('shortName', null, array(
                'label' => 'admin.fields.opinion_type.short_name',
            ))
            ->add('color', 'choice', array(
                'label' => 'admin.fields.opinion_type.color',
                'choices' => OpinionType::$colorsType,
                'translation_domain' => 'CapcoAppBundle',
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
                'label' => 'admin.fields.opinion_type.title',
            ))
            ->add('shortName', null, array(
                'label' => 'admin.fields.opinion_type.short_name',
            ))
            ->add('color', null, array(
                'label' => 'admin.fields.opinion_type.color',
                'template' => 'CapcoAdminBundle:OpinionType:color_show_field.html.twig',
                'typesColors' => OpinionType::$colorsType,
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.opinion_type.is_enabled',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.opinion_type.created_at',
            ))
            ->add('updatedAt', 'datetime', array(
                'label' => 'admin.fields.opinion_type.updated_at',
            ))
        ;
    }
}
