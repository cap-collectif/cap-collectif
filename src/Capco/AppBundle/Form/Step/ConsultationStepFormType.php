<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ConsultationStepFormType extends AbstractStepFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        parent::buildForm($builder, $options);
        $builder->add('timeless')->add('consultations', RelayNodeType::class, [
            'by_reference' => false,
            'multiple' => true,
            'class' => Consultation::class,
            'choice_label' => 'id'
        ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => ConsultationStep::class
        ]);
    }
}
