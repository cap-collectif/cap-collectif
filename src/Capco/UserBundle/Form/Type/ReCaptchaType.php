<?php
namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Validator\Constraints\ReCaptchaConstraint;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ReCaptchaType extends AbstractType
{
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'mapped' => false,
            'required' => true,
            'compound' => false,
            'constraints' => [new ReCaptchaConstraint(['groups' => ['registration']])],
        ]);
    }
}
