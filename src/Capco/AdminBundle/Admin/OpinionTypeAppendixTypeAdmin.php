<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class OpinionTypeAppendixTypeAdmin extends Admin
{
    protected $formOptions = [
        'cascade_validation' => true,
    ];

    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('position', null, [
                'label' => 'admin.fields.opiniontype_appendixtype.position',
            ])
            ->add('appendixType', 'sonata_type_model', [
                'label' => 'admin.fields.opiniontype_appendixtype.appendix_type',
                'required' => true,
                'choices_as_values' => true,
            ])
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'edit', 'delete']);
    }
}
