<?php

namespace Capco\AppBundle\Form;

use Capco\AdminBundle\Form\QuestionValidationRuleType;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class MultipleChoiceQuestionType extends AbstractQuestionType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder
            ->add('randomQuestionChoices', CheckboxType::class)
            ->add('groupedResponsesEnabled')
            ->add('responseColorsDisabled')
            ->add('otherAllowed', CheckboxType::class)
            ->add('validationRule', QuestionValidationRuleType::class)
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'allow_extra_fields' => true, // `choices` is handled in QuestionPersisterTrait.
            'csrf_protection' => false,
            'prototype' => false,
            'data_class' => MultipleChoiceQuestion::class,
        ]);
    }
}
