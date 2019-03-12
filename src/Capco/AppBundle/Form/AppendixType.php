<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\OpinionAppendix;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class AppendixType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('body', TextType::class, [
                'required' => false,
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('appendixType', null, [
                'required' => true,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => OpinionAppendix::class,
            'csrf_protection' => false,
        ]);
    }
}
