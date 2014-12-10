<?php

namespace Capco\UserBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

class RegistrationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('firstname', 'text', array('required' => false))
                ->add('lastname', 'text', array('required' => false))
                ->add('isTermsAccepted', 'checkbox', array(
                                                    'label' => 'user.register.terms.label',
                                                    'required' => true,
                                                    'translation_domain' => 'CapcoAppBundle'
                                                ) )
        ;
    }

    public function getParent()
    {
        return 'sonata_user_registration';
    }

    public function getName()
    {
        return 'capco_user_registration';
    }
}
