<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Participant;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ParticipantType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('firstname')
            ->add('lastname')
            ->add('email')
            ->add('dateOfBirth', DateTimeType::class, [
                'widget' => 'single_text',
            ])
            ->add('postalAddress')
            ->add('phone')
            ->add('token')
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Participant::class,
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
        ]);
    }
}
