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
            ->add('twitterUrl')
            ->add('facebookUrl')
            ->add('linkedInUrl')
            ->add('username', null, [
                'required' => true,
            ])
            ->add('neighborhood')
            ->add('media')
            ->add('profilePageIndexed', CheckboxType::class, [
                'label_attr' => ['style' => 'font-weight: normal; color: #000000'],
            ])
            ->add('website', 'url')
            ->add('biography', 'textarea')
        ;

        if ($this->toggleManager->isActive('user_type')) {
            $builder->add('userType', null, [
                'empty_value' => 'user.profile.edit.no_user_type',
            ]);
        }
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
