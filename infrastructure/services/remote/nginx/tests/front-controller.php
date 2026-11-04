<?php

// Synthetic handler for routing tests; application authorization is covered by the Symfony suites.
header('X-Nginx-Test-Handler: php');
$path = parse_url((string) $_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (!\is_string($path)) {
    http_response_code(400);

    return;
}

if (!str_starts_with($path, '/media/')) {
    echo 'application';

    return;
}

header('Cache-Control: private, no-store');
if (str_ends_with($path, '/denied.ttf')) {
    http_response_code(403);
    echo 'denied';
} elseif (is_file(__DIR__ . $path)) {
    readfile(__DIR__ . $path);
} else {
    http_response_code(404);
    echo 'missing';
}
