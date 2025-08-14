<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Security\UserIdentificationCode;
use Capco\AppBundle\Validator\Constraints\CheckIdentificationCode;
use Capco\AppBundle\Validator\Constraints\CheckPhoneNumber;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\TelType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ParticipantType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('firstname')
            ->add('lastname')
            ->add('email')
            ->add('dateOfBirth', DateTimeType::class, [
                'widget' => 'single_text',
            ])
            ->add('postalAddress')
            ->add('phone', TelType::class, [
                'constraints' => [new CheckPhoneNumber()],
            ])
            ->add('token')
            ->add('zipCode')
            ->add('consentInternalCommunication')
            ->add('consentPrivacyPolicy')
            ->add('userIdentificationCode', EntityType::class, [
                'class' => UserIdentificationCode::class,
                'invalid_message' => CheckIdentificationCode::BAD_CODE,
                'constraints' => [new CheckIdentificationCode()],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Participant::class,
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
        ]);
    }
}
