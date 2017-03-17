<?php

namespace Capco\UserBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class AdminConfigureRegistrationType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('bottomTextDisplayed', null, ['required' => true])
            ->add('bottomText', null, ['required' => true])
            ->add('topTextDisplayed', null, ['required' => true])
            ->add('topText', null, ['required' => true])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => 'Capco\AppBundle\Entity\RegistrationForm',
        ]);
    }
}
