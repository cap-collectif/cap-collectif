<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Entity\UserType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PublicDataType extends AbstractType
{
    public function __construct(
        private readonly Manager $toggleManager
    ) {
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
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
            ->add('profilePageIndexed', CheckboxType::class, [
                'label_attr' => ['style' => 'font-weight: normal; color: #000000'],
            ])
            ->add('websiteUrl', UrlType::class)
            ->add('biography', TextareaType::class, [
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
        ;
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
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'csrf_protection' => false,
        ]);
    }
}
