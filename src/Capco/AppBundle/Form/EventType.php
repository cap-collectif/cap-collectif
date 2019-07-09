<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Project;
use Symfony\Component\Form\AbstractType;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;

class EventType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('body', TextareaType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
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
            ->add('projects', RelayNodeType::class, [
                'multiple' => true,
                'class' => Project::class
            ])
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
