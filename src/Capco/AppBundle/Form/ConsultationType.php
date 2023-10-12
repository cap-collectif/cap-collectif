<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Consultation;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ConsultationType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class, [
                'empty_data' => '',
            ])
            ->add('description', TextType::class, [
                'empty_data' => '',
            ])
            ->add('position')
            ->add('illustration')
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => Consultation::class,
        ]);
    }
}
