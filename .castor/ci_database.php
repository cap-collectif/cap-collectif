<?php

declare(strict_types=1);

namespace Ci\Database;

use function Capco\Castor\Database\reset as sharedReset;
use Castor\Attribute\AsTask;

#[AsTask(description: 'Delete CI data, recreate the schema (migrations marked as executed, not run), reload fixtures and rebuild Elasticsearch.')]
function reset(string $environment = 'test'): void
{
    sharedReset($environment);
}
