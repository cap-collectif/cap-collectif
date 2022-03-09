<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Validator\Constraints\PasswordComplexity;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\NotBlank;

class PasswordFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('plainPassword', PasswordType::class, [
            'constraints' => [new NotBlank(), new PasswordComplexity()],
        ]);
    }
}
