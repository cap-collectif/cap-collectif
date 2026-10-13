<?php

declare(strict_types=1);

namespace Ci\Database;

use Castor\Attribute\AsTask;
use function Local\Database\generate as localGenerate;

#[AsTask(description: 'Reinitialize the CI database.')]
function generate(string $migrate = 'false', string $environment = 'dev'): void
{
    localGenerate($migrate, $environment);
}
