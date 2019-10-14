<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Debug\Debug;

require dirname(__DIR__).'/app/config/bootstrap.php';

Debug::enable();
Request::setTrustedProxies(
    ['172.17.0.0/16', '10.10.200.0/16', '127.0.0.1'],
    Request::HEADER_X_FORWARDED_ALL
);

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
