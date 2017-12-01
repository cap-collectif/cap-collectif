<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Debug\Debug;

/**
 * @var Composer\Autoload\ClassLoader $loader
 */
$loader = require __DIR__ . '/../app/autoload.php';

Debug::enable();

$request = Request::createFromGlobals();

require_once __DIR__.'/../app/AppKernel.php';

$kernel = new AppKernel('test', false);
$kernel->loadClassCache();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
