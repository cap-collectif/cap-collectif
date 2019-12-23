<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class QuestionnaireStepFormType extends AbstractStepFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder
            ->add('questionnaire', RelayNodeType::class, [
                'class' => Questionnaire::class
            ])
            ->add('footer');
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => QuestionnaireStep::class
        ]);
    }
}
