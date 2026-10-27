<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Validator\Constraints\PasswordComplexity;
use FOS\UserBundle\Form\Type\ChangePasswordFormType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\NotBlank;

class CreatePasswordFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('plainPassword', TextType::class, [
            'mapped' => false,
            'constraints' => [new PasswordComplexity(), new NotBlank()],
        ]);
    }

    public function getParent()
    {
        return ChangePasswordFormType::class;
    }
}
