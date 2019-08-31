<?php

namespace Capco\AppBundle\Sentry;

use Sentry\ClientBuilder;
use Sentry\Integration\RequestIntegration;
use Sentry\State\Hub;
use Sentry\State\HubInterface;
use Symfony\Component\HttpKernel\Kernel;

class SentryFactory
{
    public function create(
        ?string $dsn,
        string $environment,
        string $release,
        string $projectRoot,
        string $cacheDir
    ): HubInterface {
        $clientBuilder = ClientBuilder::create([
            'dsn' => $dsn,
            'environment' => $environment, // I.e.: staging, testing, production, etc.
            'project_root' => $projectRoot,
            'in_app_exclude' => [$cacheDir, "${projectRoot}/vendor"],
            'prefixes' => [$projectRoot],
            'release' => $release,
            'default_integrations' => false,
            'tags' => [
                'php_uname' => \PHP_OS,
                'php_sapi_name' => \PHP_SAPI,
                'php_version' => \PHP_VERSION,
                'framework' => 'symfony',
                'symfony_version' => Kernel::VERSION
            ]
        ]);

        // Enable Sentry RequestIntegration
        $options = $clientBuilder->getOptions();
        $options->setIntegrations([new RequestIntegration($options)]);

        $client = $clientBuilder->getClient();

        // A global HubInterface must be set otherwise some feature provided by the SDK does not work as they rely on this global state
        return Hub::setCurrent(new Hub($client));
    }
}
