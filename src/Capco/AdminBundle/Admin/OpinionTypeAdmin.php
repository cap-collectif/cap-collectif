<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Opinion;

class OpinionTypeAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
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
            ->add('versionable', null, array(
                'label' => 'admin.fields.opinion_type.versionable',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.opinion_type.updated_at',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.opinion_type.position',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

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
            ->add('versionable', null, array(
                'label' => 'admin.fields.opinion_type.versionable',
                'editable' => true,
            ))
            ->add('updatedAt', 'datetime', array(
                'label' => 'admin.fields.opinion_type.updated_at',
            ))
            ->add('defaultFilter', null, array(
                'label' => 'admin.fields.opinion_type.default_filter',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.opinion_type.position',
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
                'label' => 'admin.fields.opinion_type.title',
            ))
            ->add('shortName', null, array(
                'label' => 'admin.fields.opinion_type.short_name',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.opinion_type.position',
            ))


            // Options
            ->add('color', 'choice', array(
                'label' => 'admin.fields.opinion_type.color',
                'choices' => OpinionType::$colorsType,
                'translation_domain' => 'CapcoAppBundle',
            ))
            ->add('versionable', null, array(
                'label' => 'admin.fields.opinion_type.versionable',
                'required' => false,
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.opinion_type.is_enabled',
                'required' => false,
            ))
            ->add('defaultFilter', 'choice', array(
                'label' => 'admin.fields.opinion_type.default_filter',
                'choices' => Opinion::$sortCriterias,
                'translation_domain' => 'CapcoAppBundle',
            ))
            ->add('helpText', 'textarea', array(
                'label' => 'admin.fields.opinion_type.help_text',
                'required' => false,
            ))

            // Appendices
            ->add('appendixTypes', 'sonata_type_collection', [
                'label' => 'admin.fields.consultation.appendices',
                'by_reference' => true,
                'cascade_validation' => true,
                'required' => false,
            ], [
                'edit' => 'inline',
                'inline' => 'table',
                'sortable' => 'position',
            ])

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
            ->add('helpText', null, array(
                'label' => 'admin.fields.opinion_type.help_text',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.opinion_type.is_enabled',
            ))
            ->add('defaultFilter', null, array(
                'label' => 'admin.fields.opinion_type.default_filter',
            ))
            ->add('versionable', null, array(
                'label' => 'admin.fields.opinion_type.versionable',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.opinion_type.position',
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
