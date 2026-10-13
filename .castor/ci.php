<?php

declare(strict_types=1);

namespace Ci\Infrastructures;

use Castor\Attribute\AsTask;
use function Local\Infrastructures\build as localBuild;
use function Local\Infrastructures\up as localUp;

#[AsTask(description: 'Build CI Docker services.')]
function build(string $useCache = 'true'): void
{
    localBuild($useCache, 'ci');
}

#[AsTask(description: 'Start CI Docker services.')]
function up(string $forceRecreate = 'false', string $noCache = 'false', bool $buildAtUp = false): void
{
    if ($buildAtUp) {
        localBuild('true' === $noCache ? 'false' : 'true', 'ci');
    }

    localUp($forceRecreate, $noCache, false, 'ci');
}
