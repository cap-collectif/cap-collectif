<?php

namespace Capco\UserBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Validator\Constraints\UserPassword;

class ChangePasswordFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        // copy paste of FOSUser but we add the message to enable traduction
        $constraint = new UserPassword(['message' => 'fos_user.password.not_current']);

        $builder->add('current_password',
            PasswordType::class, [
            'label' => 'form.current_password',
            'translation_domain' => 'CapcoAppBundle',
            'mapped' => false,
            'constraints' => $constraint,
        ]);
        $builder->add('new',
            RepeatedType::class, [
            'type' => 'password',
            'options' => ['translation_domain' => 'CapcoAppBundle'],
            'first_options' => ['label' => 'form.new_password'],
            'invalid_message' => 'fos_user.password.mismatch',
        ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'FOS\UserBundle\Form\Model\ChangePassword',
            'intention' => 'change_password',
        ]);
    }
}
