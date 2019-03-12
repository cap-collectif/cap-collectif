<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Opinion;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class OpinionForm extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', TextType::class, [
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('body', TextareaType::class, [
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('appendices', CollectionType::class, [
                'entry_type' => AppendixType::class,
                'required' => false,
                'allow_add' => true,
                'by_reference' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Opinion::class,
            'csrf_protection' => false,
        ]);
    }
}
