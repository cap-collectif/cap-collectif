<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;

class QuestionChoiceAdmin extends Admin
{
    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('position', null, [
                'label' => 'admin.fields.question_choice.position',
                'required' => true,
            ])
            ->add('title', null, [
                'label' => 'admin.fields.question_choice.title',
                'required' => true,
            ])
            ->add('description', 'textarea', [
                'label' => 'admin.fields.question_choice.description',
                'required' => false,
                'attr' => [
                    'class' => '',
                ],
            ])
            ->add('image', 'sonata_type_model_list', [
                'label' => 'admin.fields.question_choice.image',
                'required' => false,
            ], [
                'link_parameters' => [
                    'context' => 'default',
                    'hide_context' => true,
                    'provider' => 'sonata.media.provider.image',
                ],
            ])
        ;
    }
}
