<?php

return [
    Symfony\Bundle\WebProfilerBundle\WebProfilerBundle::class => ['dev' => true],
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],
    Symfony\Bundle\SecurityBundle\SecurityBundle::class => ['all' => true],
    Symfony\Bundle\TwigBundle\TwigBundle::class => ['all' => true],
    Symfony\Bundle\MonologBundle\MonologBundle::class => ['all' => true],
    Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle::class => ['all' => true],
    Translation\PlatformAdapter\Loco\Bridge\Symfony\TranslationAdapterLocoBundle::class => [
        'all' => true
    ],
    Symfony\Bundle\DebugBundle\DebugBundle::class => ['dev' => true, 'test' => true],
    Translation\Bundle\TranslationBundle::class => ['all' => true],
    // Redis
    Snc\RedisBundle\SncRedisBundle::class => ['all' => true],
    Doctrine\Bundle\DoctrineBundle\DoctrineBundle::class => ['all' => true],
    Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle::class => ['all' => true],
    JMS\SerializerBundle\JMSSerializerBundle::class => ['all' => true],
    // Doctrine candies
    Doctrine\Bundle\FixturesBundle\DoctrineFixturesBundle::class => ['all' => true],
    Stof\DoctrineExtensionsBundle\StofDoctrineExtensionsBundle::class => ['all' => true],
    Liip\ImagineBundle\LiipImagineBundle::class => ['all' => true],
    // Doctrine migrations
    Doctrine\Bundle\MigrationsBundle\DoctrineMigrationsBundle::class => ['all' => true],
    // if loaded in dev => ['all' => true], the data fixtures import crashed
    Nelmio\Alice\Bridge\Symfony\NelmioAliceBundle::class => ['all' => true],
    Fidry\AliceDataFixtures\Bridge\Symfony\FidryAliceDataFixturesBundle::class => ['all' => true],
    Hautelook\AliceBundle\HautelookAliceBundle::class => ['all' => true],
    // sonata admin
    Sonata\CoreBundle\SonataCoreBundle::class => ['all' => true],
    Sonata\IntlBundle\SonataIntlBundle::class => ['all' => true],
    Sonata\BlockBundle\SonataBlockBundle::class => ['all' => true],
    Knp\Bundle\MenuBundle\KnpMenuBundle::class => ['all' => true],
    Sonata\DoctrineORMAdminBundle\SonataDoctrineORMAdminBundle::class => ['all' => true],
    Sonata\AdminBundle\SonataAdminBundle::class => ['all' => true],
    // Translations
    Sonata\TranslationBundle\SonataTranslationBundle::class => ['all' => true],
    Knp\DoctrineBehaviors\Bundle\DoctrineBehaviorsBundle::class => ['all' => true],
    // sonata user admin
    Sonata\EasyExtendsBundle\SonataEasyExtendsBundle::class => ['all' => true],
    FOS\UserBundle\FOSUserBundle::class => ['all' => true],
    Sonata\UserBundle\SonataUserBundle::class => ['all' => true],
    // HTTPlug
    Http\HttplugBundle\HttplugBundle::class => ['all' => true],
    // oauth user
    HWI\Bundle\OAuthBundle\HWIOAuthBundle::class => ['all' => true],
    Sonata\ClassificationBundle\SonataClassificationBundle::class => ['all' => true],

    // sonata media
    Sonata\MediaBundle\SonataMediaBundle::class => ['all' => true],

    // project bundles
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
    CoopTilleuls\Bundle\CKEditorSonataMediaBundle\CoopTilleulsCKEditorSonataMediaBundle::class => [
        'all' => true
    ],
    Ivory\CKEditorBundle\IvoryCKEditorBundle::class => ['all' => true],
    Caxy\HtmlDiffBundle\CaxyHtmlDiffBundle::class => ['all' => true],
    // API
    FOS\RestBundle\FOSRestBundle::class => ['all' => true],
    Nelmio\ApiDocBundle\NelmioApiDocBundle::class => ['all' => true],
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
    // CORS
    Nelmio\CorsBundle\NelmioCorsBundle::class => ['all' => true],
    // NewRelic
    Ekino\NewRelicBundle\EkinoNewRelicBundle::class => ['all' => true],
    JMS\I18nRoutingBundle\JMSI18nRoutingBundle::class => ['all' => true],
    JMS\TranslationBundle\JMSTranslationBundle::class => ['all' => true],
    //RedirectionIO
    RedirectionIO\Client\ProxySymfony\RedirectionIOBundle::class => ['all' => true],

    \Symfony\Bundle\MakerBundle\MakerBundle::class => ['dev' => true]
];
