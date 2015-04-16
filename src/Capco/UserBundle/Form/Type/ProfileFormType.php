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
            ->add('twitterName', null, array(
                'label' => 'user.profile.edit.twitter',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ))
            ->add('facebookName', null, array(
                'label' => 'user.profile.edit.facebook',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ))
            ->add('gplusName', null, array(
                'label' => 'user.profile.edit.gplus',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ))
            ->add('username', null, array(
                'label' => 'user.profile.edit.username',
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ))
            ->add('email', null, array(
                'label'    => 'user.profile.edit.email',
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ))
            ->add('city', null, array(
                'label'    => 'user.profile.edit.city',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ))
            ->add('media', 'sonata_media_type', array(
                'provider' => 'sonata.media.provider.image',
                'context' => 'default',
                'required' => false,
                'label' => 'user.profile.edit.media',
                'translation_domain' => 'CapcoAppBundle',
            ))
            ->remove('lastname')
            ->remove('firstname')
            ->add('gender', 'sonata_user_gender', array(
                'label' => 'user.profile.edit.gender',
                'required' => true,
                'translation_domain' => 'CapcoAppBundle',
            ))
            ->add('dateOfBirth', 'birthday', array(
                'required' => false,
                'label' => 'user.profile.edit.birthday',
                'translation_domain' => 'CapcoAppBundle',
            ))
        ;

        if ($this->toggleManager->isActive('user_type')) {
            $builder->add('userType', null, array(
                'required' => false,
                'empty_value' => 'user.profile.edit.no_user_type',
                'label' => 'user.profile.edit.user_type',
                'translation_domain' => 'CapcoAppBundle',
            ));
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
