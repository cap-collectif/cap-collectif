<?php

namespace Capco\AppBundle\Form;

use Capco\AdminBundle\Form\QuestionValidationRuleType;
use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class MultipleChoiceQuestionType extends AbstractQuestionType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder->add('randomQuestionChoices', CheckboxType::class);
        $builder->add('otherAllowed', CheckboxType::class);
        $builder->add('validationRule', QuestionValidationRuleType::class);
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
