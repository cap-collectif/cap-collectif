<?php

declare(strict_types=1);

require dirname(__DIR__) . '/vendor/autoload.php';

// Load cached env vars if the .env.local.php file exists
// Run "composer dump-env prod" to create it (requires symfony/flex >=1.2)
//if (is_array($env = @include dirname(__DIR__) . '/.env.local.php')) {
//    $_SERVER += $env;
//    $_ENV += $env;
//} elseif (!class_exists(Dotenv::class)) {
//    throw new RuntimeException('Please run "composer require symfony/dotenv" to load the ".env" files configuring the application.');
//}

$_SERVER['SYMFONY_ENV'] = $_ENV['SYMFONY_ENV'] =
    $_SERVER['SYMFONY_ENV'] ?? ($_ENV['SYMFONY_ENV'] ?? null) ?: 'dev';
$_SERVER['APP_DEBUG'] =
    $_SERVER['APP_DEBUG'] ?? ($_ENV['APP_DEBUG'] ?? 'prod' !== $_SERVER['SYMFONY_ENV']);
$_SERVER['APP_DEBUG'] = $_ENV['APP_DEBUG'] =
    (int) $_SERVER['APP_DEBUG'] || filter_var($_SERVER['APP_DEBUG'], \FILTER_VALIDATE_BOOLEAN)
        ? '1'
        : '0';
