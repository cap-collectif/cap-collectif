<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Steps\OtherStep;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Valid;

class OtherStepType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class)
            ->add('label', TextType::class)
            ->add('body', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('startAt', DateTimeType::class, [
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss',
            ])
            ->add('endAt', DateTimeType::class, [
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss',
            ])
            ->add('isEnabled', CheckboxType::class)
            ->add('timeless', CheckboxType::class)
            ->add('metaDescription', TextType::class)
            ->add('customCode', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => OtherStep::class,
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
            'constraints' => new Valid(),
        ]);
    }
}
