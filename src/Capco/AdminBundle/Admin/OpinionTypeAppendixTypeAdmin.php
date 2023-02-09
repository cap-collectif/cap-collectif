<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Form\Type\ModelType;

class OpinionTypeAppendixTypeAdmin extends CapcoAdmin
{
    protected array $formOptions = [
        'cascade_validation' => true,
    ];

    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    protected function configureFormFields(FormMapper $form): void
    {
        $form
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('appendixType', ModelType::class, [
                'label' => 'admin.fields.opiniontype_appendixtype.appendix_type',
                'required' => true,
            ]);
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['create', 'edit', 'delete', 'show']);
    }
}
