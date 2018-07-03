<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\Type\PurifiedTextareaType;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class OpinionForm extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', PurifiedTextType::class, ['required' => true])
            ->add('body', PurifiedTextareaType::class, ['required' => true])
            ->add('appendices',
                CollectionType::class, [
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
}
