<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Theme;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;

class EventType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default'
            ])
            ->add('body', TextareaType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default'
            ])
            ->add('startAt', DateTimeType::class, [
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss'
            ])
            ->add('endAt', DateTimeType::class, [
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss'
            ])

            ->add('enabled', CheckboxType::class)
            ->add('guestListEnabled', CheckboxType::class)
            ->add('media', EntityType::class, [
                'class' => Media::class
            ])
            ->add('metaDescription', TextType::class)

            ->add('commentable')
            ->add('link')
            ->add('addressJson', TextType::class)
            ->add('address', TextType::class)
            ->add('city', TextType::class)
            ->add('zipCode', TextType::class)
            ->add('country', TextType::class)
            ->add('projects', RelayNodeType::class, [
                'multiple' => true,
                'class' => Project::class
            ])
            ->add('customCode', TextType::class)
            ->add('author', EntityType::class, ['class' => User::class])
            ->add('themes', EntityType::class, [
                'class' => Theme::class,
                'multiple' => true,
                'expanded' => true
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => Event::class
        ]);
    }
}
