<?php

declare(strict_types=1);

namespace Local\Database;

use Capco\Castor\Database as Shared;
use Castor\Attribute\AsTask;

#[AsTask(description: 'Import dump.sql into the local database.')]
function importbdd(): void
{
    Shared\importbdd();
}

#[AsTask(description: 'Open an interactive MySQL console on the local symfony database.', aliases: ['mysql'])]
function mysql(): void
{
    Shared\mysql();
}

#[AsTask(description: 'Delete local data and recreate the schema from current entities (migrations marked as executed, not run), then reload fixtures and rebuild Elasticsearch.', aliases: ['reset-db'])]
function reset(string $environment = 'dev'): void
{
    Shared\reset($environment);
}

#[AsTask(description: 'Apply pending migrations to the existing database without resetting it or reloading fixtures.')]
function migrate(string $environment = 'dev'): void
{
    Shared\migrate($environment);
}

#[AsTask(description: 'Rebuild the active Elasticsearch index from the current database without reloading fixtures.')]
function resetElasticsearch(string $environment = 'dev'): void
{
    Shared\resetElasticsearch($environment);
}
