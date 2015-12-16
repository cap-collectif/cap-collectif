<?php

namespace Capco\UserBundle\Form\Type;

use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Security\Core\Validator\Constraints\UserPassword;

class ChangePasswordFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        // copy paste of FOSUser but we add the message to enable traduction
        $constraint = new UserPassword(['message' => 'fos_user.password.not_current']);

        $builder->add('current_password', 'password', [
            'label'              => 'form.current_password',
            'translation_domain' => 'FOSUserBundle',
            'mapped'             => false,
            'constraints'        => $constraint,
        ]);
        $builder->add('new', 'repeated', [
            'type'            => 'password',
            'options'         => ['translation_domain' => 'FOSUserBundle'],
            'first_options'   => ['label'              => 'form.new_password'],
            'second_options'  => ['label'              => 'form.new_password_confirmation'],
            'invalid_message' => 'fos_user.password.mismatch',
        ]);
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'FOS\UserBundle\Form\Model\ChangePassword',
            'intention'  => 'change_password',
        ]);
    }

    public function getName()
    {
        return 'capco_user_change_password';
    }
}
