<?php

declare(strict_types=1);

namespace Local\Qa;

use Capco\Castor\Database;
use Capco\Castor\Qa as Shared;
use Castor\Attribute\AsTask;

#[AsTask(description: 'Save the local MySQL database dump.')]
function saveDb(): void
{
    Shared\saveDb();
}

#[AsTask(description: 'Restore the local MySQL database dump.')]
function restoreDb(bool $confirm = false): void
{
    Shared\restoreDb($confirm);
}

#[AsTask(description: 'Purge the Elasticsearch RabbitMQ queue.')]
function purgeRabbitmq(bool $confirm = false): void
{
    Shared\purgeRabbitmq($confirm);
}

#[AsTask(description: 'Run PHPSpec in the application container.')]
function phpspec(string $desc = 'false'): void
{
    Shared\phpspec($desc);
}

#[AsTask(description: 'Run PHPUnit in the application container.')]
function phpunit(string $filter = 'false', string $tests = 'false', string $logJunit = 'false', string $testsuite = 'default'): void
{
    Shared\phpunit($filter, $tests, $logJunit, $testsuite);
}

#[AsTask(description: 'Save the local Elasticsearch test snapshot.')]
function saveEsSnapshot(): void
{
    Shared\saveEsSnapshot();
}

#[AsTask(description: 'Restore the Elasticsearch test snapshot.')]
function restoreEsSnapshot(bool $confirm = false): void
{
    Shared\restoreEsSnapshot(confirm: $confirm, recoveryTask: 'local:qa:regenerate-test-data --confirm');
}

#[AsTask(description: 'Reload test fixtures, then overwrite the MySQL dump and Elasticsearch snapshot used by Cypress.')]
function regenerateTestData(bool $confirm = false): void
{
    if (!$confirm) {
        throw new \InvalidArgumentException('Test data regeneration deletes local data; pass --confirm.');
    }

    Database\reset('test');
    Shared\saveDb();
    Shared\saveEsSnapshot();
}

#[AsTask(description: 'Reset test feature flags to the test preset with optional JSON overrides.')]
function resetFeatureFlags(string $overrides = '{}'): void
{
    Shared\resetFeatureFlags($overrides);
}
