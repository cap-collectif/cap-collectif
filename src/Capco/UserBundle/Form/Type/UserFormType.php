<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\AppBundle\Validator\Constraints\PasswordComplexity;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;

class UserFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('username', PurifiedTextType::class, [
                'required' => true,
                'purify_html' => true,
                'strip_tags' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('email', EmailType::class, ['required' => true])
            ->add('plainPassword', PasswordType::class, ['constraints' => [new PasswordComplexity(), new NotBlank()]])
            ->add('roles', CollectionType::class, [
                'entry_type' => TextType::class,
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
            ])
            ->add('locked', CheckboxType::class)
            ->add('vip', CheckboxType::class)
            ->add('enabled', CheckboxType::class);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['data_class' => User::class]);
    }
}
