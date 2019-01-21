<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class AppendixTypeAdmin extends CapcoAdmin
{
    protected $formOptions = [
        'cascade_validation' => true,
    ];

    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.appendix_type.title',
            ])
            ->add('helpText', null, [
                'label' => 'admin.fields.appendix_type.help_text',
            ]);
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.appendix_type.title',
            ])
            ->add('helpText', null, [
                'label' => 'admin.fields.appendix_type.help_text',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
                ],
            ]);
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.appendix_type.title',
            ])
            ->add('helpText', null, [
                'label' => 'admin.fields.appendix_type.help_text',
            ]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', null, [
                'label' => 'admin.fields.appendix_type.title',
                'required' => true,
            ])
            ->add('helpText', null, [
                'label' => 'admin.fields.appendix_type.help_text',
                'required' => false,
            ]);
    }
}
