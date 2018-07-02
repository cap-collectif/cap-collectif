<?php

namespace Capco\AdminBundle\Admin;

use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

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
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', null, [
                'label' => 'admin.fields.answer.title',
                'required' => false,
            ])
            ->add('author', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.answer.author',
                'property' => 'username',
                'required' => true,
            ])
            ->add('body', CKEditorType::class, [
                'label' => 'admin.fields.answer.body',
                'config_name' => 'admin_editor',
                'required' => true,
            ])
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'edit', 'delete']);
    }
}
