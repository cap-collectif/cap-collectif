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
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\OptionsResolver\OptionsResolver;

class FranceConnectSSOConfigurationFormType extends AbstractType
{
    public function __construct(
        private readonly RequestStack $requestStack
    ) {
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', PurifiedTextType::class, [
                'strip_tags' => true,
            ])
            ->add('enabled', CheckboxType::class)
            ->add('useV2', CheckboxType::class)
            ->add('environment', ChoiceType::class, [
                'choices' => [EnumSSOEnvironmentType::TESTING, EnumSSOEnvironmentType::PRODUCTION],
            ])
            ->add('clientId', PurifiedTextType::class, ['strip_tags' => true])
            ->add('secret', PurifiedTextType::class, ['strip_tags' => true])
            ->add('accessTokenUrl', UrlType::class)
            ->add('userInfoUrl', UrlType::class)
            ->add('authorizationUrl', UrlType::class)
            ->add('clientId', PurifiedTextType::class, ['strip_tags' => true])
            ->add('secret', PurifiedTextType::class, ['strip_tags' => true])
            ->add('logoutUrl', UrlType::class)
            ->add('allowedData')
        ;

        $domain = $this->requestStack->getCurrentRequest()?->getHost() ?? '';

        // This listener's goal is to set complete right URL based on environment sent from request.
        $builder->addEventListener(FormEvents::PRE_SUBMIT, static function (FormEvent $event) use ($domain) {
            $data = $event->getData();
            $useV2 = !empty($data['useV2']);

            if ($useV2) {
                $endpoints = FranceConnectSSOConfiguration::ENDPOINTS_V2;
                $routes = FranceConnectSSOConfiguration::ROUTES_V2;
            } else {
                $endpoints = FranceConnectSSOConfiguration::ENDPOINTS;
                $routes = FranceConnectSSOConfiguration::ROUTES;
            }

            $environment = $data['environment'] ?? EnumSSOEnvironmentType::TESTING;
            $resolvedEnvironment = $environment;

            if (
                str_contains($domain, 'capco.dev')
                && isset($endpoints[EnumSSOEnvironmentType::DEV])
            ) {
                $resolvedEnvironment = EnumSSOEnvironmentType::DEV;
            }

            if (!isset($endpoints[$resolvedEnvironment])) {
                $resolvedEnvironment = EnumSSOEnvironmentType::TESTING;
            }

            $endpoint = $endpoints[$resolvedEnvironment];

            $data['accessTokenUrl'] =
                $endpoint . $routes['accessTokenUrl'];
            $data['authorizationUrl'] =
                $endpoint . $routes['authorizationUrl'];
            $data['userInfoUrl'] = $endpoint . $routes['userInfoUrl'];
            $data['logoutUrl'] = $endpoint . $routes['logoutUrl'];

            $event->setData($data);
        });
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => FranceConnectSSOConfiguration::class,
            'csrf_protection' => false,
        ]);
    }
}
