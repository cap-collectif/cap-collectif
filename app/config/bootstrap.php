<?php

// This file is taken from Symfony 4 new ways of exposing some bootstraping. It allows to reuse the same logic
// between the app and the bin/console executable to handle .env file parsing
// https://github.com/symfony/demo/blob/master/config/bootstrap.php

use Symfony\Component\Dotenv\Dotenv;

/**
 * @var Composer\Autoload\ClassLoader $loader
 */
$loader = require dirname(__DIR__).'/autoload.php';

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
if (is_array($env = @include dirname(__DIR__).'/../.env.local.php')) {
    foreach ($env as $k => $v) {
        $_ENV[$k] = $_ENV[$k] ?? (isset($_SERVER[$k]) && 0 !== strpos($k, 'HTTP_') ? $_SERVER[$k] : $v);
    }
} elseif (!class_exists(Dotenv::class)) {
    throw new RuntimeException('Please run "composer require symfony/dotenv" to load the ".env" files configuring the application.');
} else {
    // load all the .env files
    loadEnv(new Dotenv(), dirname(__DIR__).'/../.env');
}

$_SERVER += $_ENV;
$_SERVER['APP_ENV'] = $_ENV['APP_ENV'] = ($_SERVER['APP_ENV'] ?? $_ENV['APP_ENV'] ?? null) ?: 'dev';
$_SERVER['APP_DEBUG'] = $_SERVER['APP_DEBUG'] ?? $_ENV['APP_DEBUG'] ?? 'prod' !== $_SERVER['APP_ENV'];
$_SERVER['APP_DEBUG'] = $_ENV['APP_DEBUG'] = (int) $_SERVER['APP_DEBUG'] || filter_var($_SERVER['APP_DEBUG'], FILTER_VALIDATE_BOOLEAN) ? '1' : '0';
