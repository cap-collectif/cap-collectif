<?php

if (isset($_ENV['BOOTSTRAP_CLEAR_CACHE_ENV'])) {
    passthru(sprintf(
        'php "%s/console" cache:clear --env=%s --no-warmup',
        __DIR__,
        $_ENV['BOOTSTRAP_CLEAR_CACHE_ENV']
    ));
}

passthru(sprintf(
    'php "%s/console" doctrine:fixtures:load --env=test --no-interaction --fixtures=%s',
    __DIR__,
    __DIR__.'/../src/Capco/AppBundle/Tests/TestFixtures/ORM'
));

require __DIR__.'/bootstrap.php.cache';