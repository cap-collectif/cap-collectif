<?php

namespace Capco\UserBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Capco\AppBundle\Toggle\Manager;

class ProfileFormType extends AbstractType
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('twitter_url', null, [
                'label' => 'user.profile.edit.twitter',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('facebook_url', null, [
                'label' => 'user.profile.edit.facebook',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('google_url', null, [
                'label' => 'user.profile.edit.gplus',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('username', null, [
                'label' => 'user.profile.edit.username',
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ])
            ->add('email', null, [
                'label' => 'user.profile.edit.email',
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ])
            ->add('address', null, [
                'label' => 'user.profile.edit.address',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('address2', null, [
                'label' => 'user.profile.edit.address2',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('zipCode', null, [
                'label' => 'user.profile.edit.zip_code',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('city', null, [
                'label' => 'user.profile.edit.city',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('neighborhood', null, [
                'label' => 'user.profile.edit.neighborhood',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('media', 'sonata_media_type', [
                'provider' => 'sonata.media.provider.image',
                'context' => 'default',
                'required' => false,
                'label' => 'user.profile.edit.media',
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->remove('lastname')
            ->remove('firstname')
            ->add('gender', 'sonata_user_gender', [
                'required' => true,
                'translation_domain' => 'SonataUserBundle',
            ])
            ->add('dateOfBirth', 'birthday', [
                'required' => false,
                'label' => 'user.profile.edit.birthday',
                'translation_domain' => 'CapcoAppBundle',
            ])
        ;

        if ($this->toggleManager->isActive('user_type')) {
            $builder->add('userType', null, [
                'required' => false,
                'empty_value' => 'user.profile.edit.no_user_type',
                'label' => 'user.profile.edit.user_type',
                'translation_domain' => 'CapcoAppBundle',
            ]);
        }
    }

    public function getParent()
    {
        return 'sonata_user_profile';
    }

    public function getName()
    {
        return 'capco_user_profile';
    }
}
