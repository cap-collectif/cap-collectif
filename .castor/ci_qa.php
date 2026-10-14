<?php

declare(strict_types=1);

namespace Ci\Qa;

use function Capco\Castor\Qa\phpunit as sharedPhpunit;
use function Capco\Castor\Qa\purgeRabbitmq as sharedPurgeRabbitmq;
use function Capco\Castor\Qa\restoreDb as sharedRestoreDb;
use function Capco\Castor\Qa\restoreEsSnapshot as sharedRestoreEsSnapshot;
use function Capco\Castor\Qa\saveDb as sharedSaveDb;
use function Capco\Castor\Qa\saveEsSnapshot as sharedSaveEsSnapshot;
use Castor\Attribute\AsTask;

#[AsTask(description: 'Purge the Elasticsearch RabbitMQ queue in CI.')]
function purgeRabbitmq(bool $confirm = false): void
{
    sharedPurgeRabbitmq(confirm: $confirm);
}

#[AsTask(description: 'Restore the CI MySQL database dump.')]
function restoreDb(bool $confirm = false): void
{
    sharedRestoreDb(confirm: $confirm);
}

#[AsTask(description: 'Save the CI MySQL database dump.')]
function saveDb(): void
{
    sharedSaveDb();
}

#[AsTask(description: 'Run PHPUnit in CI.')]
function phpunit(string $filter = 'false', string $tests = 'false', string $logJunit = 'false'): void
{
    sharedPhpunit(filter: $filter, tests: $tests, logJunit: $logJunit);
}

#[AsTask(description: 'Save the CI Elasticsearch test snapshot.')]
function saveEsSnapshot(): void
{
    sharedSaveEsSnapshot();
}

#[AsTask(description: 'Restore the CI Elasticsearch test snapshot.')]
function restoreEsSnapshot(bool $confirm = false): void
{
    sharedRestoreEsSnapshot(confirm: $confirm);
}
