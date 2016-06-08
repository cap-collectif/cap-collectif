<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Form\FormMapper;

class ResponseAdmin extends Admin
{
    protected $formOptions = [
        'cascade_validation' => true,
    ];

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('question', null, [
                'label' => 'admin.fields.response.question',
                'required' => false,
                'read_only' => true,
                'disabled' => true,
            ])
            ->add('value', null, [
                'label' => 'admin.fields.response.value',
                'required' => false,
                'read_only' => true,
            ])
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['edit', 'delete']);
    }
}
