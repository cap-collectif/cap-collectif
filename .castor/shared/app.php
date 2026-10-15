<?php

declare(strict_types=1);

namespace Capco\Castor\App;

use function Capco\Castor\application;
use function Castor\context;
use function Castor\io;
use function Castor\run;

function clearCache(string $environment = 'dev'): void
{
    if (!preg_match('/\A[a-z0-9_-]+\z/', $environment)) {
        throw new \InvalidArgumentException('Environment contains unsupported characters.');
    }

    application(sprintf('rm -rf var/cache/%s', escapeshellarg($environment)), 'root');
    application(sprintf('php -d memory_limit=-1 bin/console cache:pool:clear cache.app --no-debug --env=%s', escapeshellarg($environment)));
}

/** @param list<string> $arguments */
function console(
    string $commandName = '',
    string $environment = 'dev',
    array $arguments = [],
): void {
    if (!preg_match('/\A[a-zA-Z0-9:_-]+\z/', $commandName)) {
        throw new \InvalidArgumentException('Command name contains unsupported characters.');
    }

    if (!\in_array($environment, ['dev', 'test'], true)) {
        throw new \InvalidArgumentException("Command execution only supports 'dev' and 'test'.");
    }

    $command = [
        'php',
        '-d',
        'memory_limit=-1',
        'bin/console',
        $commandName,
        ...$arguments,
        '--no-interaction',
        '--env=' . $environment,
    ];

    application(implode(' ', array_map('escapeshellarg', $command)), 'root');
}

function toggleEnable(string $toggle, string $environment = 'test'): void
{
    if (!preg_match('/\A[a-zA-Z0-9_.:-]+\z/', $toggle) || !preg_match('/\A[a-z0-9_-]+\z/', $environment)) {
        throw new \InvalidArgumentException('Toggle or environment contains unsupported characters.');
    }

    application(sprintf(
        'php bin/console capco:toggle:enable %s --no-interaction --env=%s',
        $toggle,
        escapeshellarg($environment),
    ));
}

function toggleDisable(string $toggle, string $environment = 'test'): void
{
    if (!preg_match('/\A[a-zA-Z0-9_.:-]+\z/', $toggle) || !preg_match('/\A[a-z0-9_-]+\z/', $environment)) {
        throw new \InvalidArgumentException('Toggle or environment contains unsupported characters.');
    }

    application(sprintf(
        'php bin/console capco:toggle:disable %s --no-interaction --env=%s',
        $toggle,
        escapeshellarg($environment),
    ));
}

function rabbitmqQueues(): void
{
    application('php bin/rabbit vhost:mapping:create --vhost=${SYMFONY_RABBITMQ_VHOST:-capco} --user=${SYMFONY_RABBITMQ_LOGIN:-guest} --password=${SYMFONY_RABBITMQ_PASSWORD:-guest} --erase-vhost config/rabbitmq.yaml');
}

function startConsumers(): void
{
    application('if pgrep supervisord; then pkill supervisord; sleep 3; fi', 'root');
    application('supervisord --configuration=/etc/supervisord/supervisord.conf', 'root');
}

function stopConsumers(): void
{
    application('if pgrep supervisord; then pkill supervisord; sleep 3; fi', 'root');
}

function swarrotConsume(string $name): void
{
    if (!preg_match('/\A[a-zA-Z0-9_.:-]+\z/', $name)) {
        throw new \InvalidArgumentException('Queue name contains unsupported characters.');
    }

    application(sprintf('php -d memory_limit=-1 bin/console swarrot:consume:%s %s', $name, $name));
}

function setupDefaultEnvVars(): void
{
    $variables = <<<'ENV'
        APP_ENV=dev
        SYMFONY_ENV=dev
        APP_DEBUG=1

        VAULT_URL=https://fake-url.com
        VAULT_TOKEN=INSERT_A_REAL_SECRET

        # If you want to enable address geolocation, set this variables
        # https://developers.google.com/maps/documentation/javascript/get-api-key
        # scopes: "Geocoding API", "Maps JavaScript API", "Places API"
        SYMFONY_GOOGLE_MAP_PUBLIC_KEY=INSERT_A_REAL_SECRET
        # scopes: "Geocoding API"
        SYMFONY_GOOGLE_MAP_SERVER_KEY=INSERT_A_REAL_SECRET
        SYMFONY_REMEMBER_SECRET=INSERT_A_REAL_SECRET
        SYMFONY_INSTANCE_REMEMBER_SECRET=INSERT_A_REAL_SECRET

        # If you want to enable captcha, set the variables:
        SYMFONY_RECAPTCHA_PRIVATE_KEY=INSERT_A_REAL_SECRET

        SYMFONY_DATABASE_NAME=symfony

        SYMFONY_ANONYMIZATION_INACTIVITY_DAYS=365
        SYMFONY_ANONYMIZATION_INACTIVITY_EMAIL_REMINDER_DAYS=7

        SYMFONY_MAILER_URL=smtp://127.0.0.1

        # If you want to enable sms, set the variables:
        # from https://console.twilio.com
        SYMFONY_TWILIO_SID=INSERT_A_REAL_SECRET
        SYMFONY_TWILIO_TOKEN=INSERT_A_REAL_SECRET
        SYMFONY_TWILIO_DEFAULT_SUBACCOUNT_TOKEN=INSERT_A_REAL_SECRET
        SYMFONY_TWILIO_DEFAULT_SUBACCOUNT_SID=INSERT_A_REAL_SECRET
        SYMFONY_TWILIO_DEFAULT_VERIFY_SERVICE_ID=INSERT_A_REAL_SECRET
        SYMFONY_TWILIO_DEFAULT_ALPHA_SENDER_ID=INSERT_A_REAL_SECRET
        SYMFONY_TWILIO_DEFAULT_SERVICE_ID=INSERT_A_REAL_SECRET

        SYMFONY_DISABLE_MAIL_DELIVERY=true
        # If you set the variable SYMFONY_DISABLE_MAIL_DELIVERY to "false" to enable, set also the following variables:
        SYMFONY_MANDRILL_API_KEY=INSERT_A_REAL_SECRET
        SYMFONY_MAILJET_PUBLIC_KEY=INSERT_A_REAL_SECRET
        SYMFONY_MAILJET_PRIVATE_KEY=INSERT_A_REAL_SECRET

        # Facebook
        SYMFONY_DEFAULT_FACEBOOK_CLIENT_ID=INSERT_A_REAL_SECRET
        SYMFONY_DEFAULT_FACEBOOK_SECRET=INSERT_A_REAL_SECRET

        # France Connect
        # Tokens can be found here:
        # https://partenaires.franceconnect.gouv.fr/monprojet/edition/e71799d4430405d19c2ab344c1c20421e94bf203af7ccaf714ad1858baa4d568
        SYMFONY_DEFAULT_FRANCE_CONNECT_CLIENT_ID=INSERT_A_REAL_SECRET
        SYMFONY_DEFAULT_FRANCE_CONNECT_CLIENT_SECRET=INSERT_A_REAL_SECRET

        # SSO
        SYMFONY_DEFAULT_OAUTH_CLIENT_ID=INSERT_A_REAL_SECRET
        SYMFONY_DEFAULT_OAUTH_CLIENT_SECRET=INSERT_A_REAL_SECRET
        SYMFONY_DEFAULT_OAUTH_AUTHORIZATION_URL=https://fake-url.com
        SYMFONY_DEFAULT_OAUTH_ACCESS_TOKEN_URL=https://fake-url.com
        SYMFONY_DEFAULT_OAUTH_USER_INFO_URL=https://fake-url.com
        SYMFONY_DEFAULT_OAUTH_LOGOUT_URL=https://fake-url.com
        SYMFONY_DEFAULT_OAUTH_PROFILE_URL=https://fake-url.com

        SYMFONY_INSTANCE_SAML_PASSWORD=INSERT_A_REAL_SECRET

        SYMFONY_CAS_CERTIFICATE_DIRECTORY=../app/config/cas

        # Blackfire
        BLACKFIRE_SERVER_ID=INSERT_A_REAL_SECRET
        BLACKFIRE_SERVER_TOKEN=INSERT_A_REAL_SECRET
        BLACKFIRE_CLIENT_ID=INSERT_A_REAL_SECRET
        BLACKFIRE_CLIENT_TOKEN=INSERT_A_REAL_SECRET

        # Host mapping
        SYMFONY_DATABASE_HOST=127.0.0.1
        SYMFONY_REDIS_HOST=127.0.0.1
        SYMFONY_REDIS_PREFIX=dev
        SYMFONY_ELASTICSEARCH_HOST=127.0.0.1
        SYMFONY_RABBITMQ_HOST=127.0.0.1
        SYMFONY_RABBITMQ_NODENAME=127.0.0.1
        SYMFONY_ASSETS_HOST=

        # ElasticSearch Cloudflare logpush traffic
        SYMFONY_LOGPUSH_ELASTICSEARCH_HOST=INSERT_A_REAL_SECRET
        SYMFONY_LOGPUSH_ELASTICSEARCH_PORT=INSERT_A_REAL_SECRET
        SYMFONY_LOGPUSH_ELASTICSEARCH_INDEX=INSERT_A_REAL_SECRET
        SYMFONY_LOGPUSH_ELASTICSEARCH_USERNAME=INSERT_A_REAL_SECRET
        SYMFONY_LOGPUSH_ELASTICSEARCH_PASSWORD=INSERT_A_REAL_SECRET

        # Sendinblue
        SYMFONY_SENDINBLUE_API_KEY=INSERT_A_REAL_SECRET
        # 12 is the ID of dev liste, the prod list is 3
        SYMFONY_SENDINBLUE_NL_LIST_ID=12
        SYMFONY_SENDINBLUE_SECRET=INSERT_A_REAL_SECRET

        # OpenId BackChannel Access
        SYMFONY_OPENID_BACKCHANNEL_SECRET=INSERT_A_REAL_SECRET
        SYMFONY_OPENID_BACKCHANNEL_SECRET_DEV=INSERT_A_REAL_SECRET

        # Clefs Turnstile capco.dev
        SYMFONY_TURNSTILE_PUBLIC_KEY=INSERT_A_REAL_SECRET
        SYMFONY_TURNSTILE_PRIVATE_KEY=INSERT_A_REAL_SECRET
        SYMFONY_MAGICLINKS_DURATION_IN_DAYS=0

        # SMS One-Time-Password provider
        SYMFONY_SMS_PROVIDER=orange
        SYMFONY_ORANGE_API_CLIENT_ID=INSERT_A_REAL_SECRET
        SYMFONY_ORANGE_API_CLIENT_SECRET=INSERT_A_REAL_SECRET

        # 1password
        SYMFONY_ONEPASSWORD_CONNECT_URL=https://passwords-hub-api-green.cap-collectif.com
        SYMFONY_ONEPASSWORD_CONNECT_TOKEN=INSERT_A_REAL_SECRET
        SYMFONY_ONEPASSWORD_VAULT_ID=INSERT_A_REAL_SECRET
        ENV;

    io()->writeln('Generating your default environment variables...');

    if (false === file_put_contents('.env.local', $variables)) {
        throw new \RuntimeException('Unable to write .env.local.');
    }

    io()->writeln('Created .env.local file');
}

function compileGraphql(string $environment = 'dev'): void
{
    validateEnvironment($environment);
    application(sprintf('php -d memory_limit=-1 bin/console graphql:compile --no-debug --env=%s', escapeshellarg($environment)));
    application('COMPOSER_MEMORY_LIMIT=-1 composer dump-autoload');
}

function dumpGraphqlSchemas(bool $checkSame = false, string $environment = 'dev'): void
{
    validateEnvironment($environment);
    foreach (['public', 'preview', 'internal', 'dev'] as $schema) {
        application(sprintf(
            'bin/console graphql:dump-schema --env %s --schema %s --no-debug --file schema.%s.graphql --format graphql',
            escapeshellarg($environment),
            escapeshellarg($schema),
            $schema,
        ));
    }

    if ($checkSame) {
        run([
            '/bin/bash',
            '-c',
            "if [[ \$(git diff -G. --name-only '*.graphql' | wc -c) -ne 0 ]]; then git --no-pager diff '*.graphql'; exit 1; fi",
        ]);
    }
}

function validateEnvironment(string $environment): void
{
    if (!\in_array($environment, ['dev', 'test'], true)) {
        throw new \InvalidArgumentException("Application preparation only supports 'dev' and 'test'.");
    }
}

/** @param list<string> $arguments */
function composer(array $arguments = []): void
{
    if ([] === $arguments) {
        $arguments = ['install', '--prefer-dist', '--no-interaction', '--ignore-platform-reqs', '--no-progress'];
    }

    application(
        'COMPOSER_MEMORY_LIMIT=-1 composer ' . implode(' ', array_map('escapeshellarg', $arguments)),
        interactive: context()->supportsInteraction() && stream_isatty(\STDERR),
    );
}

function installAssets(string $environment = 'dev'): void
{
    validateEnvironment($environment);
    application(sprintf('php -d memory_limit=-1 bin/console assets:install public --symlink --env=%s', escapeshellarg($environment)));
}

function generateGraphql(string $environment = 'dev', bool $backendOnly = false): void
{
    validateEnvironment($environment);
    clearCache($environment);
    compileGraphql($environment);
    dumpGraphqlSchemas(environment: $environment);

    if ($backendOnly) {
        return;
    }

    run(['corepack', 'yarn', 'run', 'build-relay-schema']);
    run(['corepack', 'yarn', 'workspace', 'admin-next', 'run', 'relay']);
}
