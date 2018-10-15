<?php
namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\AbstractLogicJumpCondition;
use Capco\AppBundle\Entity\MultipleChoiceQuestionLogicJumpCondition;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;

class LogicJumpConditionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('id');
        $builder->add('operator');
        $builder->add('question');
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
