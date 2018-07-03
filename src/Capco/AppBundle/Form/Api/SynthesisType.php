<?php

namespace Capco\AppBundle\Form\Api;

use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class SynthesisType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('enabled', null, ['required' => false])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Synthesis::class,
            'csrf_protection' => false,
        ]);
    }
}
