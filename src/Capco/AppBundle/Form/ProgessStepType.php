<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProgessStepType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title',
                PurifiedTextType::class, [
                'required' => true,
            ])
            ->add('startAt', DateTimeType::class, [
              'widget' => 'single_text',
              'format' => 'Y-MM-dd HH:mm:ss',
              // 'required' => true
            ])
            ->add('endAt', DateTimeType::class, [
              'widget' => 'single_text',
              'format' => 'Y-MM-dd HH:mm:ss',
              // 'required' => false
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\ProgressStep',
            'csrf_protection' => false,
        ]);
    }
}
