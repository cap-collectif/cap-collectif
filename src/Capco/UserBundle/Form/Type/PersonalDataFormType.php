<?php

namespace Capco\UserBundle\Form\Type;

use Symfony\Component\Form\Extension\Core\Type\TextType;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PersonalDataFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('firstname', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('lastname', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('address', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('address2', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('zipCode')
            ->add('city', TextType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('phone')
            ->add('email', EmailType::class)
            ->add('phoneConfirmed')
            ->add('dateOfBirth', DateTimeType::class, [
                'widget' => 'single_text',
                'format' => 'Y-MM-dd',
            ])
            ->add('gender', ChoiceType::class, ['choices' => array_keys(User::getGenderList())]);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['data_class' => User::class]);
    }
}
