<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\MultipleChoiceQuestionLogicJumpCondition;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class LogicJumpConditionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('id');
        $builder->add('operator');
        $builder->add('question', RelayNodeType::class, ['class' => AbstractQuestion::class]);
        $builder->add('value');
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => MultipleChoiceQuestionLogicJumpCondition::class,
            'allow_extra_fields' => true,
        ]);
    }
}
