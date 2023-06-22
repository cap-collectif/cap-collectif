<?php

return [
    Sonata\Exporter\Bridge\Symfony\SonataExporterBundle::class => ['all' => true],
    Symfony\Bundle\WebProfilerBundle\WebProfilerBundle::class => ['dev' => true],
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],
    Symfony\Bundle\SecurityBundle\SecurityBundle::class => ['all' => true],
    Symfony\Bundle\TwigBundle\TwigBundle::class => ['all' => true],
    Symfony\Bundle\MonologBundle\MonologBundle::class => ['all' => true],
    Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle::class => ['all' => true],
    Translation\PlatformAdapter\Loco\Bridge\Symfony\TranslationAdapterLocoBundle::class => [
        'all' => true,
    ],
    Symfony\Bundle\DebugBundle\DebugBundle::class => ['dev' => true, 'test' => true],
    Translation\Bundle\TranslationBundle::class => ['all' => true],
    // Redis
    Snc\RedisBundle\SncRedisBundle::class => ['all' => true],
    Doctrine\Bundle\DoctrineBundle\DoctrineBundle::class => ['all' => true],
    Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle::class => ['all' => true],
    JMS\SerializerBundle\JMSSerializerBundle::class => ['all' => true],
    // Doctrine candies
    Stof\DoctrineExtensionsBundle\StofDoctrineExtensionsBundle::class => ['all' => true],
    Liip\ImagineBundle\LiipImagineBundle::class => ['all' => true],
    // Doctrine migrations
    Doctrine\Bundle\MigrationsBundle\DoctrineMigrationsBundle::class => ['all' => true],
    // if loaded in dev => ['all' => true], the data fixtures import crashed
    Nelmio\Alice\Bridge\Symfony\NelmioAliceBundle::class => ['all' => true],
    Fidry\AliceDataFixtures\Bridge\Symfony\FidryAliceDataFixturesBundle::class => ['all' => true],
    Hautelook\AliceBundle\HautelookAliceBundle::class => ['all' => true],
    // sonata admin
    Sonata\IntlBundle\SonataIntlBundle::class => ['all' => true],
    Sonata\BlockBundle\SonataBlockBundle::class => ['all' => true],
    Knp\Bundle\MenuBundle\KnpMenuBundle::class => ['all' => true],
    Sonata\DoctrineORMAdminBundle\SonataDoctrineORMAdminBundle::class => ['all' => true],
    Sonata\AdminBundle\SonataAdminBundle::class => ['all' => true],
    // Translations
    Knp\DoctrineBehaviors\Bundle\DoctrineBehaviorsBundle::class => ['all' => true],
    // sonata user admin
    //    Sonata\EasyExtendsBundle\SonataEasyExtendsBundle::class => ['all' => true],
    FOS\UserBundle\FOSUserBundle::class => ['all' => true],
    // HTTPlug
    Http\HttplugBundle\HttplugBundle::class => ['all' => true],
    // oauth user
    HWI\Bundle\OAuthBundle\HWIOAuthBundle::class => ['all' => true],

    // sonata media
    Sonata\Doctrine\Bridge\Symfony\SonataDoctrineBundle::class => ['all' => true],
    Sonata\Form\Bridge\Symfony\SonataFormBundle::class => ['all' => true],
    Sonata\Twig\Bridge\Symfony\SonataTwigBundle::class => ['all' => true], // project bundles
    Capco\AppBundle\CapcoAppBundle::class => ['all' => true],
    Capco\AdminBundle\CapcoAdminBundle::class => ['all' => true],
    Capco\UserBundle\CapcoUserBundle::class => ['all' => true],
    Capco\MediaBundle\CapcoMediaBundle::class => ['all' => true],
    Capco\ClassificationBundle\CapcoClassificationBundle::class => ['all' => true],
    FOS\HttpCacheBundle\FOSHttpCacheBundle::class => ['all' => true],
    // feature activation / deactivation
    Qandidate\Bundle\ToggleBundle\QandidateToggleBundle::class => ['all' => true],
    // typography concerns
    JoliTypo\Bridge\Symfony\JoliTypoBundle::class => ['all' => true],
    // CKEditor
    FOS\CKEditorBundle\FOSCKEditorBundle::class => ['all' => true],
    Caxy\HtmlDiffBundle\CaxyHtmlDiffBundle::class => ['all' => true],
    // GraphQL
    Overblog\GraphQLBundle\OverblogGraphQLBundle::class => ['all' => true],
    // Swarrot to publish and consume rabbitmq messages
    Swarrot\SwarrotBundle\SwarrotBundle::class => ['all' => true],
    // Server side Js rendering
    Limenius\ReactBundle\LimeniusReactBundle::class => ['all' => true],
    Misd\PhoneNumberBundle\MisdPhoneNumberBundle::class => ['all' => true],
    // Secure our forms against XSS
    Exercise\HTMLPurifierBundle\ExerciseHTMLPurifierBundle::class => ['all' => true],
    // Saml
    Hslavich\SimplesamlphpBundle\HslavichSimplesamlphpBundle::class => ['all' => true],
    // Excel files generation
    Liuggio\ExcelBundle\LiuggioExcelBundle::class => ['all' => true],
    // PolyCollection support.
    Infinite\FormBundle\InfiniteFormBundle::class => ['all' => true],
    Overblog\DataLoaderBundle\OverblogDataLoaderBundle::class => ['all' => true],
    Overblog\GraphiQLBundle\OverblogGraphiQLBundle::class => ['all' => true],
    // NewRelic
    Ekino\NewRelicBundle\EkinoNewRelicBundle::class => ['all' => true],
    JMS\I18nRoutingBundle\JMSI18nRoutingBundle::class => ['all' => true],
    JMS\TranslationBundle\JMSTranslationBundle::class => ['all' => true],
    //RedirectionIO
    RedirectionIO\Client\ProxySymfony\RedirectionIOBundle::class => ['all' => true],

    Symfony\Bundle\MakerBundle\MakerBundle::class => ['dev' => true],
];
