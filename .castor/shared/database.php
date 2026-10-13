<?php

declare(strict_types=1);

namespace Capco\Castor\Database;

use function Capco\Castor\application;
use function Castor\io;

function generate(string $environment = 'dev', bool $verbose = false): void
{
    if (!\in_array($environment, ['dev', 'test', 'prod'], true)) {
        throw new \InvalidArgumentException("Local database generation only supports 'dev', 'test' and 'prod'.");
    }

    application('rm -rf public/media/* && mkdir -p public/media && chown -R capco:capco public/media', 'root');

    $command = sprintf(
        'php -d memory_limit=-1 bin/console capco:reinit --force --env=%s',
        escapeshellarg($environment),
    );

    if ($verbose) {
        $command .= ' --verbose';
    }

    application($command);
}

function importbdd(): void
{
    application('cat dump.sql | mysql -u root symfony');
}

function mysql(): void
{
    application('mysql -u root -h 127.0.0.1 symfony', interactive: true);
}

function reset(string $environment = 'dev'): void
{
    \Capco\Castor\App\validateEnvironment($environment);
    generate(environment: $environment, verbose: io()->isVerbose());
}

function migrate(string $environment = 'dev'): void
{
    \Capco\Castor\App\console('doctrine:migration:migrate', $environment);
}

function resetElasticsearch(string $environment = 'dev'): void
{
    \Capco\Castor\App\validateEnvironment($environment);
    \Capco\Castor\App\console('capco:es:create', $environment);
    \Capco\Castor\App\console('capco:es:populate', $environment);
}
