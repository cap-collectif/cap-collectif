<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Validator\Constraints\PasswordComplexity;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\NotBlank;

class RecreatePasswordFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $constraints = [new NotBlank(), new PasswordComplexity()];

        $builder->add('plainPassword', RepeatedType::class, [
            'type' => PasswordType::class,
            'options' => [
                'translation_domain' => 'FOSUserBundle',
                'attr' => [
                    'autocomplete' => 'new-password'
                ]
            ],
            'constraints' => $constraints,
            'first_options' => ['label' => 'form.new_password'],
            'second_options' => ['label' => 'form.new_password_confirmation'],
            'invalid_message' => 'fos_user.password.mismatch'
        ]);
    }
}
