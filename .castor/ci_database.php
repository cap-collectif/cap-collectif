<?php

declare(strict_types=1);

namespace Ci\Database;

use Castor\Attribute\AsTask;

use function Capco\Castor\Database\reset as sharedReset;

#[AsTask(description: 'Delete CI data, recreate the schema (migrations marked as executed, not run), reload fixtures and rebuild Elasticsearch.')]
function reset(string $environment = 'test'): void
{
    sharedReset($environment);
}
