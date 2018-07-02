<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Form\Type\PurifiedTextareaType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class AppendixType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('body',
                PurifiedTextareaType::class, [
                'required' => false,
            ])
            ->add('appendixType', null, [
                'required' => true,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => OpinionAppendix::class,
            'csrf_protection' => false,
        ]);
    }
}
