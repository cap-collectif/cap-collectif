<?php

declare(strict_types=1);

namespace Local\Database;

use function Capco\Castor\application;
use Castor\Attribute\AsTask;

#[AsTask(description: 'Reinitialize the local database.')]
function generate(string $migrate = 'false', string $environment = 'dev'): void
{
    if (!\in_array($environment, ['dev', 'test', 'prod'], true)) {
        throw new \InvalidArgumentException("Local database generation only supports 'dev', 'test' and 'prod'.");
    }

    application('rm -rf public/media/* && mkdir -p public/media && chown -R capco:capco public/media', 'root');

    $command = sprintf(
        'php -d memory_limit=-1 bin/console capco:reinit --force --env=%s',
        escapeshellarg($environment),
    );

    if ('true' === $migrate) {
        $command .= ' --migrate';
    }

    application($command);
}

#[AsTask(description: 'Import dump.sql into the local database.')]
function importbdd(): void
{
    application('cat dump.sql | mysql -u root symfony');
}

#[AsTask(description: 'Open a MySQL console in the local application container.')]
function mysqlconsole(): void
{
    application('mysql -u root -h 127.0.0.1 symfony', interactive: true);
}
