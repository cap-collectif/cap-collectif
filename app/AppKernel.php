<?php

use Symfony\Component\Config\Loader\LoaderInterface;
use Symfony\Component\HttpKernel\Kernel;

class AppKernel extends Kernel
{
    public function registerBundles(): array
    {
        $bundles = [
            new Symfony\Bundle\FrameworkBundle\FrameworkBundle(),
            new Symfony\Bundle\SecurityBundle\SecurityBundle(),
            new Symfony\Bundle\TwigBundle\TwigBundle(),
            new Symfony\Bundle\MonologBundle\MonologBundle(),
            new Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle(),
            new Translation\PlatformAdapter\Loco\Bridge\Symfony\TranslationAdapterLocoBundle(),
            new Translation\Bundle\TranslationBundle(),
            // Redis
            new Snc\RedisBundle\SncRedisBundle(),
            new Doctrine\Bundle\DoctrineBundle\DoctrineBundle(),
            new Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle(),
            new JMS\SerializerBundle\JMSSerializerBundle(),
            // Doctrine candies
            new Doctrine\Bundle\FixturesBundle\DoctrineFixturesBundle(),
            new Stof\DoctrineExtensionsBundle\StofDoctrineExtensionsBundle(),
            new Liip\ImagineBundle\LiipImagineBundle(),
            // Doctrine migrations
            new Doctrine\Bundle\MigrationsBundle\DoctrineMigrationsBundle(),
            // if loaded in dev, the data fixtures import crashed
            new Nelmio\Alice\Bridge\Symfony\NelmioAliceBundle(),
            new Fidry\AliceDataFixtures\Bridge\Symfony\FidryAliceDataFixturesBundle(),
            new Hautelook\AliceBundle\HautelookAliceBundle(),
            // sonata admin
            new Sonata\CoreBundle\SonataCoreBundle(),
            new Sonata\IntlBundle\SonataIntlBundle(),
            new Sonata\BlockBundle\SonataBlockBundle(),
            new Knp\Bundle\MenuBundle\KnpMenuBundle(),
            new Sonata\DoctrineORMAdminBundle\SonataDoctrineORMAdminBundle(),
            new Sonata\AdminBundle\SonataAdminBundle(),
            // sonata user admin
            new Sonata\EasyExtendsBundle\SonataEasyExtendsBundle(),
            new FOS\UserBundle\FOSUserBundle(),
            new Sonata\UserBundle\SonataUserBundle('FOSUserBundle'),
            // HTTPlug
            new \Http\HttplugBundle\HttplugBundle(),
            // oauth user
            new HWI\Bundle\OAuthBundle\HWIOAuthBundle(),
            new Sonata\ClassificationBundle\SonataClassificationBundle(),

            // sonata media
            new Sonata\MediaBundle\SonataMediaBundle(),
            // Prometheus
            new TweedeGolf\PrometheusBundle\TweedeGolfPrometheusBundle(),
            // project bundles
            new Capco\AppBundle\CapcoAppBundle(),
            new Capco\AdminBundle\CapcoAdminBundle(),
            new Capco\UserBundle\CapcoUserBundle(),
            new Capco\MediaBundle\CapcoMediaBundle(),
            new Capco\ClassificationBundle\CapcoClassificationBundle(),
            new FOS\HttpCacheBundle\FOSHttpCacheBundle(),
            // feature activation / deactivation
            new Qandidate\Bundle\ToggleBundle\QandidateToggleBundle(),
            // typography concerns
            new JoliTypo\Bridge\Symfony\JoliTypoBundle(),
            // CKEditor
            new \CoopTilleuls\Bundle\CKEditorSonataMediaBundle\CoopTilleulsCKEditorSonataMediaBundle(),
            new \Ivory\CKEditorBundle\IvoryCKEditorBundle(),
            new Caxy\HtmlDiffBundle\CaxyHtmlDiffBundle(),
            // API
            new \FOS\RestBundle\FOSRestBundle(),
            new \Nelmio\ApiDocBundle\NelmioApiDocBundle(),
            // GraphQL
            new Overblog\GraphQLBundle\OverblogGraphQLBundle(),
            // Swarrot to publish and consume rabbitmq messages
            new Swarrot\SwarrotBundle\SwarrotBundle(),
            // Server side Js rendering
            new Limenius\ReactBundle\LimeniusReactBundle(),
            new Misd\PhoneNumberBundle\MisdPhoneNumberBundle(),
            // Secure our forms against XSS
            new Exercise\HTMLPurifierBundle\ExerciseHTMLPurifierBundle(),
            // Saml
            new Hslavich\SimplesamlphpBundle\HslavichSimplesamlphpBundle(),
            // Excel files generation
            new Liuggio\ExcelBundle\LiuggioExcelBundle(),
            // PolyCollection support.
            new \Infinite\FormBundle\InfiniteFormBundle(),
            new Overblog\DataLoaderBundle\OverblogDataLoaderBundle(),
            new Overblog\GraphiQLBundle\OverblogGraphiQLBundle(),
            // CORS
            new Nelmio\CorsBundle\NelmioCorsBundle(),
            // NewRelic
            new Ekino\NewRelicBundle\EkinoNewRelicBundle(),
            // Mandrill
            new Accord\MandrillSwiftMailerBundle\AccordMandrillSwiftMailerBundle(),
        ];

        if (in_array($this->getEnvironment(), ['dev', 'test'], true)) {
            $bundles[] = new Symfony\Bundle\DebugBundle\DebugBundle();
            $bundles[] = new Symfony\Bundle\WebProfilerBundle\WebProfilerBundle();
            // TODO must be removed for sf4
            $bundles[] = new Sensio\Bundle\DistributionBundle\SensioDistributionBundle();
        }

        if (in_array($this->getEnvironment(), ['dev', 'prod'], true)) {
            // ICU translation
            $bundles[] = new \Webfactory\IcuTranslationBundle\WebfactoryIcuTranslationBundle();
        }

        if ('prod' === $this->getEnvironment()) {
            $bundles[] = new Sentry\SentryBundle\SentryBundle();
        }

        return $bundles;
    }

    public function getCacheDir(): string
    {
        return dirname(__DIR__) . '/var/cache/' . $this->environment;
    }

    public function getLogDir(): string
    {
        return dirname(__DIR__) . '/var/logs';
    }

    public function registerContainerConfiguration(LoaderInterface $loader)
    {
        $loader->load(__DIR__ . '/config/config_' . $this->getEnvironment() . '.yml');
    }
}
