<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\BirthdayType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;

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
            ->add('twitterUrl', null, [
                'label' => 'user.profile.edit.twitter',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('facebookUrl', null, [
                'label' => 'user.profile.edit.facebook',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('googleUrl', null, [
                'label' => 'user.profile.edit.gplus',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
            ->add('username', null, [
                'label' => 'user.profile.edit.username',
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
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
            ->remove('phone')
            ->add('profilePageIndexed', CheckboxType::class, [
                'required' => false,
                'label' => 'user.profile.edit.profilePageIndexed',
                'label_attr' => ['style' => 'font-weight: normal; color: #000000'],
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
}
