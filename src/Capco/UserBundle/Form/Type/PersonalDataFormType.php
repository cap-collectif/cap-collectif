<?php

namespace Capco\UserBundle\Form\Type;

use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PersonalDataFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add(
                'firstname',
                null,
                [
                    'label' => 'user.profile.edit.firstname',
                    'translation_domain' => 'CapcoAppBundle',
                    'required' => false,
                ]
            )
            ->add(
                'lastname',
                null,
                [
                    'label' => 'user.profile.edit.lastname',
                    'translation_domain' => 'CapcoAppBundle',
                    'required' => false,
                ]
            )
            ->add(
                'address',
                null,
                [
                    'label' => 'user.profile.edit.address',
                    'translation_domain' => 'CapcoAppBundle',
                    'required' => false,
                ]
            )
            ->add(
                'address2',
                null,
                [
                    'label' => 'user.profile.edit.address2',
                    'translation_domain' => 'CapcoAppBundle',
                    'required' => false,
                ]
            )
            ->add(
                'zipCode',
                null,
                [
                    'label' => 'user.profile.edit.zip_code',
                    'translation_domain' => 'CapcoAppBundle',
                    'required' => false,
                ]
            )
            ->add(
                'city',
                null,
                [
                    'label' => 'user.profile.edit.city',
                    'translation_domain' => 'CapcoAppBundle',
                    'required' => false,
                ]
            )
            ->add(
                'phone',
                null,
                [
                    'label' => 'form.label_phone',
                    'translation_domain' => 'CapcoAppBundle',
                    'required' => false,
                ]
            )
            ->add(
                'dateOfBirth',
                DateTimeType::class,
                [
                    'widget' => 'single_text',
                    'format' => 'Y-MM-dd',
                    'required' => false,
                ]
            )
            ->add(
                'gender',
                ChoiceType::class,
                [
                    'label' => 'form.label_gender',
                    'required' => false,
                    'translation_domain' => 'CapcoAppBundle',
                    'choices' => User::getGenderList(),
                ]
            );
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(
            [
                'data_class' => User::class,
            ]
        );
    }
}
