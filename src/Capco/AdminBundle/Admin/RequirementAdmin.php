<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Requirement;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

class RequirementAdmin extends CapcoAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    protected $formOptions = [
        'cascade_validation' => true,
    ];

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('type', ChoiceType::class, [
                'choices' => array_flip(Requirement::$requirementsLabels),
                'label' => 'group.title',
                'required' => true,
                'translation_domain' => 'CapcoAppBundle',
                'attr' => [
                    'class' => 'select-type',
                    'placeholder' => 'help-text-for-reason-for-collection-field',
                ],
            ])
            ->add('label', null, [
                'label' => 'label',
                'required' => false,
                'attr' => [
                    'placeholder' => 'i-certify-that-i-am-over-16-years-old',
                    'disabled' => true,
                    'class' => 'checkbox-label',
                ],
            ]);
    }

    // Fields to be shown on show page

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
    }

    // Fields to be shown on filter forms

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
    }

    // Fields to be shown on lists

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
    }
}
