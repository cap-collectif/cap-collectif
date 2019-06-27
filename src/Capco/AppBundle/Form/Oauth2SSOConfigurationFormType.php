<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class Oauth2SSOConfigurationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name')
            ->add('enabled')
            ->add('accessTokenUrl')
            ->add('userInfoUrl')
            ->add('authorizationUrl')
            ->add('clientId')
            ->add('secret')
            ->add('profileUrl')
            ->add('logoutUrl');
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Oauth2SSOConfiguration::class,
            'csrf_protection' => false
        ]);
    }
}
