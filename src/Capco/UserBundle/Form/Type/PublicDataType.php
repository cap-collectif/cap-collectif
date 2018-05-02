<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PublicDataType extends AbstractType
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
            ->add('linkedInUrl', null, [
                'label' => 'user.profile.edit.linkedIn',
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
            ->add('media')
            ->add('profilePageIndexed', CheckboxType::class, [
                'required' => false,
                'label' => 'user.profile.edit.profilePageIndexed',
                'label_attr' => ['style' => 'font-weight: normal; color: #000000'],
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->add('website', 'url', array(
                'label'    => 'form.label_website',
                'required' => false,
            ))
            ->add('biography', 'textarea', array(
                'label'    => 'form.label_biography',
                'required' => false,
            ))
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
}
