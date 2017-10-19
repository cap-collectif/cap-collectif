<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;

class QuestionnaireAbstractQuestionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('position', IntegerType::class);

        $builder->addEventListener(FormEvents::PRE_SUBMIT, function (FormEvent $event) {
            if (!$data = $event->getData()) {
                return;
            }
            $event->getForm()
                    ->add('question', 7 === (int) $data['question']['type'] ? MediaQuestionType::class : SimpleQuestionType::class);
        }, 999);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => QuestionnaireAbstractQuestion::class,
        ]);
    }
}
