<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Validator\Constraints\PasswordComplexity;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Security\Core\Validator\Constraints\UserPassword;
use Symfony\Component\Validator\Constraints\NotBlank;

class ChangePasswordFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        // copy paste of FOSUser but we add the message to enable traduction
        $constraint = [
            new NotBlank(),
            new UserPassword(['message' => 'fos_user.password.not_current'])
        ];
        $builder
            ->add('current_password', PasswordType::class, [
                'mapped' => false,
                'constraints' => $constraint
            ])
            ->add('new_password', TextType::class, [
                'mapped' => false,
                'constraints' => [new PasswordComplexity(), new NotBlank()]
            ]);
    }

    public function getParent()
    {
        return 'fos_user_change_password';
    }
}
