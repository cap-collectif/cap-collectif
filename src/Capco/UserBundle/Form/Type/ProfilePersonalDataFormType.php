<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Sonata\UserBundle\Model\UserInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\BirthdayType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\DateTime;

class ProfilePersonalDataFormType extends AbstractType
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
                array(
                    'label' => 'form.label_phone',
                    'translation_domain' => 'CapcoAppBundle',
                    'required' => false,
                )
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
                array(
                    'label' => 'form.label_gender',
                    'required' => false,
                    'translation_domain' => 'CapcoAppBundle',
                    'choices' => array(
                        UserInterface::GENDER_FEMALE => 'FEMALE',
                        UserInterface::GENDER_MALE => 'MALE',
                        User::GENDER_OTHER => 'OTHER',
                    ),
                )
            );
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(
            array(
                'data_class' => User::class,
            )
        );
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'capco_user_personal_data';
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return $this->getBlockPrefix();
    }
}
