<?php
namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\AbstractLogicJumpCondition;
use Capco\AppBundle\Entity\MultipleChoiceQuestionLogicJumpCondition;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;


class LogicJumpConditionType extends AbstractType
{
    private $isMultipleChoiceQuestion = false;
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('id');
        $builder->add('operator');
        $builder->add('question');
        $builder->add('jump');
        $builder->addEventListener(FormEvents::PRE_SET_DATA, function (FormEvent $event) {
            if (!$data = $event->getData()) {
                return;
            }
            $form = $event->getForm();
            $question = $data->getQuestion();

            if ($question instanceof MultipleChoiceQuestion) {
                $this->isMultipleChoiceQuestion = true;
                $form->add('value');
            }
        });
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['csrf_protection' => false, 'data_class' => $this->isMultipleChoiceQuestion ? MultipleChoiceQuestionLogicJumpCondition::class : AbstractLogicJumpCondition::class]);
    }
}
