<?php

if (isset($_ENV['BOOTSTRAP_CLEAR_CACHE_ENV'])) {
    passthru(sprintf(
        'php "%s/console" cache:clear --env=%s --no-warmup',
        __DIR__,
        $_ENV['BOOTSTRAP_CLEAR_CACHE_ENV']
    ));
}

passthru(sprintf(
    'php "%s/console" doctrine:schema:update --env=test --no-interaction --force',
    __DIR__
));

require __DIR__.'/bootstrap.php.cache';