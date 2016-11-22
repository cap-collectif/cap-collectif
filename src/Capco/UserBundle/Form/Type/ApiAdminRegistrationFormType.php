<?php

namespace Capco\UserBundle\Form\Type;

use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\TextType;

class ApiAdminRegistrationFormType extends ApiRegistrationFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder->remove('plainPassword');
        $builder->remove('captcha');
        $builder->add('roles', CollectionType::class, [
          'entry_type' => TextType::class,
          'validation_groups' => ['registration']
        ]);
    }
}
