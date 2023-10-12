<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ConsultationStepFormType extends AbstractStepFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder
            ->add('consultations', CollectionType::class, [
                'entry_type' => RelayNodeType::class,
                'entry_options' => ['class' => Consultation::class],
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
            ])
            ->add('timeless')
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => ConsultationStep::class,
        ]);
    }
}
