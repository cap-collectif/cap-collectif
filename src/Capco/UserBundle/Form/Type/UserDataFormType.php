<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Entity\Security\UserIdentificationCode;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Validator\Constraints\CheckIdentificationCode;
use Capco\AppBundle\Validator\Constraints\CheckPhoneNumber;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Entity\UserType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TelType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class UserDataFormType extends AbstractType
{
    public function __construct(private readonly Manager $toggleManager)
    {
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
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
                'constraints' => [new CheckPhoneNumber()],
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
                'invalid_message' => CheckIdentificationCode::BAD_CODE,
                'constraints' => [new CheckIdentificationCode()],
            ])
            ->add('twitterUrl', UrlType::class)
            ->add('instagramUrl', UrlType::class)
            ->add('facebookUrl', UrlType::class)
            ->add('linkedInUrl', UrlType::class)
            ->add('username', PurifiedTextType::class, [
                'strip_tags' => true,
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('neighborhood')
            ->add('media')
            ->add('profilePageIndexed', CheckboxType::class)
            ->add('websiteUrl', UrlType::class)
            ->add('biography', TextareaType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'admin',
                'constraints' => [new Assert\Length([
                    'max' => 246,
                    'maxMessage' => 'MAX_LENGTH_EXCEEDED',
                ])],
            ])
            ->add('locked', CheckboxType::class)
            ->add('vip', CheckboxType::class)
            ->add('enabled', CheckboxType::class)
            ->add('roles', CollectionType::class, [
                'entry_type' => TextType::class,
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
            ])
        ;
        $builder->add('subscribedToProposalNews', CheckboxType::class);
        if ($this->toggleManager->isActive('user_type')) {
            $builder->add('userType', RelayNodeType::class, [
                'required' => false,
                'class' => UserType::class,
                'empty_data' => null,
            ]);
        }
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'csrf_protection' => false,
            'stepId' => null,
            'constraints' => [
                new UniqueEntity([
                    'entityClass' => User::class,
                    'fields' => 'email',
                    'message' => 'EMAIL_ALREADY_USED',
                ]),
            ],
        ]);
    }
}
