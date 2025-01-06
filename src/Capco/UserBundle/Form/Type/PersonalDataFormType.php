<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Entity\Security\UserIdentificationCode;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\AppBundle\Validator\Constraints\CheckPhoneNumber;
use Capco\UserBundle\Entity\User;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TelType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PersonalDataFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('firstname', PurifiedTextType::class, [
                'purify_html' => true,
                'strip_tags' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('lastname', PurifiedTextType::class, [
                'strip_tags' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('postalAddress', PurifiedTextType::class, [
                'strip_tags' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('address', PurifiedTextType::class, [
                'strip_tags' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('address2', PurifiedTextType::class, [
                'strip_tags' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('zipCode')
            ->add('city', PurifiedTextType::class, [
                'strip_tags' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('phone', TelType::class, [
                'constraints' => [new CheckPhoneNumber([
                    'stepId' => $options['stepId'],
                ])],
            ])
            ->add('email', EmailType::class)
            ->add('phoneConfirmed')
            ->add('birthPlace')
            ->add('dateOfBirth', DateType::class, [
                'widget' => 'single_text',
            ])
            ->add('gender', ChoiceType::class, ['choices' => array_keys(User::getGenderList())])
            ->add('userIdentificationCode', EntityType::class, [
                'class' => UserIdentificationCode::class,
            ])
        ;
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'csrf_protection' => false,
            'stepId' => null,
        ]);
    }
}
