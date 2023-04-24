<?php

use App\Kernel;
use Symfony\Component\Debug\Debug;
use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\HttpFoundation\Request;

require __DIR__ . '/../vendor/autoload.php';

// The check is to ensure we don't use .env in production
if (!isset($_SERVER['SYMFONY_ENV']) || 'prod' !== $_SERVER['SYMFONY_ENV']) {
    if (!class_exists(Dotenv::class)) {
        throw new \RuntimeException(
            'SYMFONY_ENV environment variable is not defined. You need to define environment variables for configuration or add "symfony/dotenv" as a Composer dependency to load variables from a .env file.'
        );
    }
    // Useful when using Symfony binary, do not remove it.
    if (file_exists(__DIR__ . '/../.env.local')) {
        (new Dotenv())->load(__DIR__ . '/../.env.local');
    }
    if (file_exists(__DIR__ . '/../.env.' . $_SERVER['SYMFONY_ENV'] . '.local')) {
        (new Dotenv())->load(__DIR__ . '/../.env.' . $_SERVER['SYMFONY_ENV'] . '.local');
    }
}

$env = $_SERVER['SYMFONY_ENV'];
$debug = (bool) ($_SERVER['APP_DEBUG'] ?? 'dev' === $env);

if ($debug) {
    umask(0000);

    Debug::enable();
}

// We can set this in config on SF 5.x
// https://symfony.com/doc/4.4/deployment/proxies.html
$trustedProxies = $_SERVER['SYMFONY_TRUSTED_PROXIES'] ?? false;
Request::setTrustedProxies(
    array_merge(['127.0.0.1', '172.17.0.1'], explode(',', $trustedProxies)),
    Request::HEADER_X_FORWARDED_ALL ^ Request::HEADER_X_FORWARDED_HOST
);

if ($trustedHosts = $_SERVER['SYMFONY_TRUSTED_HOSTS'] ?? false) {
    Request::setTrustedHosts(explode(',', $trustedHosts));
}

// This part is for infraV2 only. We get all information sended by the router,
// And we transform them into Symfony app variable.
if ($instanceName = $_SERVER['HTTP_X_SYMFONY_INSTANCE_NAME'] ?? false) {
    $_ENV['SYMFONY_INSTANCE_NAME'] = $_SERVER['HTTP_X_SYMFONY_INSTANCE_NAME'];

    $_ENV['SYMFONY_DATABASE_NAME'] = $_SERVER['HTTP_X_SYMFONY_DATABASE_NAME'];
    $_ENV['SYMFONY_DATABASE_HOST'] = $_SERVER['HTTP_X_SYMFONY_DATABASE_HOST'];
    $_ENV['SYMFONY_DATABASE_USER'] = $_SERVER['HTTP_X_SYMFONY_DATABASE_USER'];
    $_ENV['SYMFONY_DATABASE_PASSWORD'] = $_SERVER['HTTP_X_SYMFONY_DATABASE_PASSWORD'];

    $_ENV['SYMFONY_RABBITMQ_HOST'] = $_SERVER['HTTP_X_SYMFONY_RABBITMQ_HOST'];
    $_ENV['SYMFONY_RABBITMQ_NODENAME'] = $_SERVER['HTTP_X_SYMFONY_RABBITMQ_NODENAME'];

    $_ENV['SYMFONY_REDIS_HOST'] = $_SERVER['HTTP_X_SYMFONY_REDIS_HOST'];
    $_ENV['SYMFONY_REDIS_PREFIX'] = $_SERVER['HTTP_X_SYMFONY_REDIS_PREFIX'];

    $_ENV['SYMFONY_ELASTICSEARCH_HOST'] = $_SERVER['HTTP_X_SYMFONY_ELASTICSEARCH_HOST'];
    $_ENV['SYMFONY_ELASTICSEARCH_INDEX'] = $_SERVER['HTTP_X_SYMFONY_ELASTICSEARCH_INDEX'];
}

$kernel = new Kernel($env, $debug);
$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
