<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProjectFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', PurifiedTextType::class, [
                'required' => true,
                'purify_html' => true,
                'strip_tags' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('email', EmailType::class, ['required' => true])
            ->add('plainPassword', PasswordType::class);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['data_class' => User::class]);
    }
}
