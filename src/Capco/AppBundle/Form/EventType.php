<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Event;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\FormBuilderInterface;
use Capco\AppBundle\Form\Type\PurifiedTextareaType;
use Symfony\Component\OptionsResolver\OptionsResolver;

class EventType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', PurifiedTextType::class)
            ->add('body', PurifiedTextareaType::class)
            ->add('startAt', DateTimeType::class, [
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss',
            ])
            ->add('endAt', DateTimeType::class, [
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss',
            ])
            ->add('registrationEnable')
            ->add('enabled')
            ->add('commentable')
            ->add('link')
            ->add('zipCode')
            ->add('address')
            ->add('metaDescription')
            ->add('customCode')
            ->add('city')
            ->add('country')
            ->add('projects')
            ->add('themes');
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => Event::class,
        ]);
    }
}
