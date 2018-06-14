<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Form\AbstractType;
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
            ])
            ->add('facebookUrl', null, [
                'label' => 'user.profile.edit.facebook',
            ])
            ->add('linkedInUrl', null, [
            ])
            ->add('username', null, [
                'required' => true,
            ])
            ->add('neighborhood', null, [
            ])
            ->add('media', 'sonata_media_type', [
                'provider' => 'sonata.media.provider.image',
                'context' => 'default',
            ])
            ->remove('lastname')
            ->remove('firstname')
            ->remove('phone')
            ->add('profilePageIndexed', CheckboxType::class, [
                'label_attr' => ['style' => 'font-weight: normal; color: #000000'],
            ])
        ;

        if ($this->toggleManager->isActive('user_type')) {
            $builder->add('userType', null, [
                'empty_data' => 'user.profile.edit.no_user_type',
            ]);
        }
    }

    public function getParent()
    {
        return 'sonata_user_profile';
    }
}
