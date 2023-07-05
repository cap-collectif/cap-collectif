<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;

class ResponseAdmin extends CapcoAdmin
{
    protected array $formOptions = [
        'cascade_validation' => true,
    ];

    protected function configureFormFields(FormMapper $form): void
    {
        $form
            ->add('question', null, [
                'label' => 'admin.fields.response.question',
                'required' => false,
                'attr' => ['readonly' => true, 'disabled' => true],
            ])
            ->add('value', null, [
                'label' => 'admin.fields.response.value',
                'required' => false,
                'attr' => ['readonly' => true],
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['edit', 'delete', 'show']);
    }
}
