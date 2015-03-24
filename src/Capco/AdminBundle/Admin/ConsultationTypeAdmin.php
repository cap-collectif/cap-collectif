<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class ConsultationTypeAdmin extends Admin
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
                'label' => 'admin.fields.consultation_type.title',
            ))
            ->add('opinionTypes', null, array(
                'label' => 'admin.fields.consultation_type.opinion_types',
            ))
            ->add('enabled', null, array(
                'label' => 'admin.fields.consultation_type.enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.consultation_type.updated_at',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.consultation_type.created_at',
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
                'label' => 'admin.fields.consultation_type.title',
            ))
            ->add('opinionTypes', 'sonata_type_model', array(
                'label' => 'admin.fields.consultation_type.opinion_types',
            ))
            ->add('enabled', null, array(
                'label' => 'admin.fields.consultation_type.enabled',
                'editable' => true,
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.consultation_type.updated_at',
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
                'label' => 'admin.fields.consultation_type.title',
            ))
            ->add('opinionTypes', 'sonata_type_model', array(
                'label' => 'admin.fields.consultation_type.opinion_types',
                'by_reference' => false,
                'multiple' => true,
                'expanded' => false,
            ))
            ->add('enabled', null, array(
                'label' => 'admin.fields.consultation_type.enabled',
                'required' => false,
            ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $subject = $this->getSubject();

        $showMapper
            ->add('title', null, array(
                'label' => 'admin.fields.consultation_type.title',
            ))
            ->add('opinionTypes', 'sonata_type_model', array(
                'label' => 'admin.fields.consultation_type.opinion_types',
            ))
            ->add('enabled', null, array(
                'label' => 'admin.fields.consultation_type.enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.consultation_type.updated_at',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.consultation_type.created_at',
            ))
        ;
    }
}
