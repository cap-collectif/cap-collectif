<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProgessStepType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        // 'required' => true
        $builder
            ->add('title', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default',
                'required' => true,
            ])
            ->add('startAt', DateTimeType::class, [
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss',
            ])
            ->add('endAt', DateTimeType::class, [
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss',
                // 'required' => false
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\ProgressStep',
            'csrf_protection' => false,
        ]);
    }
}
