<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class OpinionForm extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', 'text', ['required' => true])
            ->add('body', 'purified_textarea', ['required' => true])
            ->add('appendices', 'collection', [
                'type' => new AppendixType(),
                'required' => false,
                'allow_add' => true,
                'by_reference' => false,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\Opinion',
            'csrf_protection' => false,
        ]);
    }

    public function getName() : string
    {
        return 'opinion';
    }
}
