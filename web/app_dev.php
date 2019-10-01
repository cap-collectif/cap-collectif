<?php

use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Debug\Debug;

/**
 * @var Composer\Autoload\ClassLoader $loader
 */
$loader = require __DIR__ . '/../app/autoload.php';

Debug::enable();
Request::setTrustedProxies(
    ['172.17.0.0/16', '10.10.200.0/16', '127.0.0.1'],
    Request::HEADER_X_FORWARDED_ALL
);

// This methode is taken from https://github.com/symfony/dotenv/blob/master/Dotenv.php, because we currently
// can't use the last version of Dotenv component (needs Symfony > 4), but I just need this method
function loadEnv(Dotenv $dotenv, string $path, string $varName = 'APP_ENV', string $defaultEnv = 'dev', array $testEnvs = ['test']): void
{
    if (file_exists($path) || !file_exists($p = "$path.dist")) {
        $dotenv->load($path);
    } else {
        $dotenv->load($p);
    }
    if (null === $env = $_SERVER[$varName] ?? $_ENV[$varName] ?? null) {
        $dotenv->populate([$varName => $env = $defaultEnv]);
    }
    if (!\in_array($env, $testEnvs, true) && file_exists($p = "$path.local")) {
        $dotenv->load($p);
        $env = $_SERVER[$varName] ?? $_ENV[$varName] ?? $env;
    }
    if ('local' === $env) {
        return;
    }
    if (file_exists($p = "$path.$env")) {
        $dotenv->load($p);
    }
    if (file_exists($p = "$path.$env.local")) {
        $dotenv->load($p);
    }
}

// Load cached env vars if the .env.local.php file exists
// Run "composer dump-env prod" to create it (requires symfony/flex >=1.2)
if (is_array($env = @include dirname(__DIR__).'/.env.local.php')) {
    foreach ($env as $k => $v) {
        $_ENV[$k] = $_ENV[$k] ?? (isset($_SERVER[$k]) && 0 !== strpos($k, 'HTTP_') ? $_SERVER[$k] : $v);
    }
} elseif (!class_exists(Dotenv::class)) {
    throw new RuntimeException('Please run "composer require symfony/dotenv" to load the ".env" files configuring the application.');
} else {
    // load all the .env files
    loadEnv(new Dotenv(), dirname(__DIR__).'/.env');
}

$request = Request::createFromGlobals();

if (
    !\Symfony\Component\HttpFoundation\IpUtils::checkIp($request->getClientIp(), array(
        '78.192.6.1',
        '10.1.33.1',
        '192.168.10.0/16',
        '10.8.0.0/16',
        '127.0.0.1',
        '172.17.0.0/16',
        'fe80::1',
        '::1',
    ))
) {
    header('HTTP/1.0 403 Forbidden');
    exit(
        'Ip ' .
            $request->getClientIp() .
            ' is not allowed to access this file. Check ' .
            basename(__FILE__) .
            ' for more information.'
    );
}

require_once __DIR__ . '/../app/AppKernel.php';

$kernel = new AppKernel('dev', true);
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
