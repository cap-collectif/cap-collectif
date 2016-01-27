<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Question;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class QuestionAdmin extends Admin
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
            ->add('position', 'integer', [
                'label' => 'admin.fields.question.position',
            ])
            ->add('title', null, [
                'label' => 'admin.fields.question.title',
                'required' => true,
            ])
            ->add('helpText', null, [
                'label' => 'admin.fields.question.help_text',
                'required' => true,
            ])
            ->add('questionType', 'choice', [
                'label' => 'admin.fields.question.question_type',
                'choices' => Question::$questionTypesLabels,
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ])
            ->add('required', null, [
                'label' => 'admin.fields.question.required',
            ])
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'edit', 'delete']);
    }

    public function getBatchActions()
    {
        return;
    }

}
