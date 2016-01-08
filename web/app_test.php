<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Debug\Debug;

// If you don't want to setup permissions the proper way, just uncomment the following PHP line
// read http://symfony.com/doc/current/book/installation.html#checking-symfony-application-configuration-and-setup
// for more information
$loader = require_once __DIR__.'/../app/bootstrap.php.cache';

$request = Request::createFromGlobals();

Debug::enable();

require_once __DIR__.'/../app/AppKernel.php';

$kernel = new AppKernel('test', true);
$kernel->loadClassCache();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
