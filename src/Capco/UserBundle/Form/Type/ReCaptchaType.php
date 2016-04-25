<?php

namespace Capco\UserBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Capco\UserBundle\Form\Type\ApiRegistrationFormType;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Capco\AppBundle\Validator\Constraints\ReCaptchaConstraint;

class ReCaptchaType extends AbstractType
{
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'mapped' => false,
            'required' => true,
            'compound' => false,
            'constraints' => [
              new ReCaptchaConstraint(['groups' => ['registration']]),
            ],
        ]);
    }
}
