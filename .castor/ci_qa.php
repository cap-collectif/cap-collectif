<?php

declare(strict_types=1);

namespace Ci\Qa;

use Castor\Attribute\AsTask;
use function Local\Qa\graphqlSchemas as localGraphqlSchemas;
use function Local\Qa\phpunit as localPhpunit;
use function Local\Qa\purgeRabbitmq as localPurgeRabbitmq;
use function Local\Qa\restoreDb as localRestoreDb;
use function Local\Qa\restoreEsSnapshot as localRestoreEsSnapshot;
use function Local\Qa\saveDb as localSaveDb;
use function Local\Qa\saveEsSnapshot as localSaveEsSnapshot;

#[AsTask(description: 'Generate GraphQL schemas in CI.')]
function graphqlSchemas(bool $checkSame = false): void
{
    localGraphqlSchemas($checkSame);
}

#[AsTask(description: 'Purge the Elasticsearch RabbitMQ queue in CI.')]
function purgeRabbitmq(bool $confirm = false): void
{
    localPurgeRabbitmq(confirm: true);
}

#[AsTask(description: 'Restore the CI MySQL database dump.')]
function restoreDb(bool $confirm = false): void
{
    localRestoreDb(confirm: true);
}

#[AsTask(description: 'Save the CI MySQL database dump.')]
function saveDb(): void
{
    localSaveDb();
}

#[AsTask(description: 'Run PHPUnit in CI.')]
function phpunit(string $tests = 'false', string $logJunit = 'false'): void
{
    localPhpunit(tests: $tests, logJunit: $logJunit);
}

#[AsTask(description: 'Save the CI Elasticsearch test snapshot.')]
function saveEsSnapshot(): void
{
    localSaveEsSnapshot();
}

#[AsTask(description: 'Restore the CI Elasticsearch test snapshot.')]
function restoreEsSnapshot(bool $confirm = false): void
{
    localRestoreEsSnapshot(confirm: true);
}
