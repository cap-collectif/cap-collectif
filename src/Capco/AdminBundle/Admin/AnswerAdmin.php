<?php

namespace Capco\AdminBundle\Admin;

use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Form\Type\ModelAutocompleteType;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;

class AnswerAdmin extends CapcoAdmin
{
    protected $formOptions = [
        'cascade_validation' => true,
    ];

    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    public function getBatchActions()
    {
        return [];
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
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
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'edit', 'delete']);
    }
}
