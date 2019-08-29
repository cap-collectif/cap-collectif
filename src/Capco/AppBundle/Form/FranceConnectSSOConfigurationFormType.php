<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\DBAL\Enum\EnumSSOEnvironmentType;
use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;

class FranceConnectSSOConfigurationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', PurifiedTextType::class, [
                'strip_tags' => true
            ])
            ->add('enabled', CheckboxType::class)
            ->add('environment', ChoiceType::class, [
                'choices' => [EnumSSOEnvironmentType::TESTING, EnumSSOEnvironmentType::PRODUCTION]
            ])
            ->add('clientId', PurifiedTextType::class, ['strip_tags' => true])
            ->add('secret', PurifiedTextType::class, ['strip_tags' => true])
            ->add('accessTokenUrl', UrlType::class)
            ->add('userInfoUrl', UrlType::class)
            ->add('authorizationUrl', UrlType::class)
            ->add('clientId', PurifiedTextType::class, ['strip_tags' => true])
            ->add('secret', PurifiedTextType::class, ['strip_tags' => true])
            ->add('logoutUrl', UrlType::class);

        // This listener's goal is to set complete right URL based on environment sent from request.
        $builder->addEventListener(FormEvents::PRE_SUBMIT, static function (FormEvent $event) {
            $data = $event->getData();

            $endpoint = FranceConnectSSOConfiguration::ENDPOINTS[$data['environment']];

            $data['accessTokenUrl'] =
                $endpoint . FranceConnectSSOConfiguration::ROUTES['accessTokenUrl'];
            $data['authorizationUrl'] =
                $endpoint . FranceConnectSSOConfiguration::ROUTES['authorizationUrl'];
            $data['userInfoUrl'] = $endpoint . FranceConnectSSOConfiguration::ROUTES['userInfoUrl'];
            $data['logoutUrl'] = $endpoint . FranceConnectSSOConfiguration::ROUTES['logoutUrl'];

            $event->setData($data);
        });
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => FranceConnectSSOConfiguration::class,
            'csrf_protection' => false
        ]);
    }
}
