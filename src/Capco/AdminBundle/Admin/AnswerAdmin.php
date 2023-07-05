<?php

namespace Capco\AdminBundle\Admin;

use FOS\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;

class AnswerAdmin extends CapcoAdmin
{
    protected array $formOptions = [
        'cascade_validation' => true,
    ];

    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    protected function configureFormFields(FormMapper $form): void
    {
        $form
            ->add('title', null, [
                'label' => 'global.title',
                'required' => false,
            ])
            ->add('author', null, [
                'label' => 'global.author',
            ])
            ->add('body', CKEditorType::class, [
                'label' => 'global.contenu',
                'config_name' => 'admin_editor',
                'required' => true,
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['create', 'edit', 'delete']);
    }
}
