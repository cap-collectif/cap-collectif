<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Status;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class StatusAdmin extends CapcoAdmin
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
            ->add('name', null, [
                'label' => 'global.name',
                'required' => true,
            ])
            ->add('color', 'choice', [
                'choices' => Status::$statusesLabels,
                'label' => 'global.color',
                'required' => true,
                'translation_domain' => 'CapcoAppBundle',
            ])
        ;
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
