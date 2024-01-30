<?php

namespace Capco\AppBundle\Sentry;

use Sentry\ClientBuilder;
use Sentry\Integration\RequestFetcher;
use Sentry\Integration\RequestIntegration;
use Sentry\SentrySdk;
use Sentry\State\Hub;
use Sentry\State\HubInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class SentryFactory
{
    public function create(
        ?string $dsn,
        string $environment,
        string $release,
        string $projectRoot,
        string $cacheDir
    ): HubInterface {
        $options = [
            'dsn' => $dsn,
            'environment' => $environment, // I.e.: staging, testing, production, etc.
            'in_app_exclude' => [$cacheDir, "{$projectRoot}/vendor"],
            'prefixes' => [$projectRoot],
            'release' => $release,
            'default_integrations' => true,
            'capture_silenced_errors' => false,
            'enable_compression' => true,
            'error_types' => \E_ALL & ~\E_NOTICE & ~\E_DEPRECATED,
            'ignore_exceptions' => [
                AccessDeniedException::class,
                NotFoundHttpException::class,
                AccessDeniedHttpException::class,
                BadRequestHttpException::class,
            ],
            'attach_stacktrace' => false,
            'tags' => [
                'php_uname' => \PHP_OS,
                'php_sapi_name' => \PHP_SAPI,
                'php_version' => \PHP_VERSION,
                'framework' => 'symfony',
                'symfony_version' => Kernel::VERSION,
            ],
        ];

        $clientBuilder = ClientBuilder::create($options);

        // Enable Sentry RequestIntegration
        $clientBuilder
            ->getOptions()
            ->setIntegrations([new RequestIntegration(new RequestFetcher(), [])])
        ;

        $client = $clientBuilder->getClient();

        // A global HubInterface must be set otherwise some feature provided by the SDK does not work as they rely on this global state
        return SentrySdk::setCurrentHub(new Hub($client));
    }
}
