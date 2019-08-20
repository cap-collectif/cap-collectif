<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ColorType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class Oauth2SSOConfigurationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', PurifiedTextType::class, [
                'strip_tags' => true
            ])
            ->add('enabled', CheckboxType::class)
            ->add('accessTokenUrl', UrlType::class)
            ->add('userInfoUrl', UrlType::class)
            ->add('authorizationUrl', UrlType::class)
            ->add('clientId', PurifiedTextType::class, ['strip_tags' => true])
            ->add('secret', PurifiedTextType::class, ['strip_tags' => true])
            ->add('profileUrl', UrlType::class)
            ->add('logoutUrl', UrlType::class)
            ->add('buttonColor', ColorType::class)
            ->add('labelColor', ColorType::class);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Oauth2SSOConfiguration::class,
            'csrf_protection' => false
        ]);
    }
}
