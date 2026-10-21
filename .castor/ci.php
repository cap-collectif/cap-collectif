<?php

declare(strict_types=1);

namespace Ci\Infrastructures;

use Castor\Attribute\AsTask;

use function Capco\Castor\Infrastructures\build as sharedBuild;
use function Capco\Castor\Infrastructures\up as sharedUp;

#[AsTask(description: 'Build CI Docker services.')]
function build(bool $noCache = false): void
{
    sharedBuild($noCache, 'ci');
}

#[AsTask(description: 'Start CI Docker services.')]
function up(bool $forceRecreate = false, bool $noCache = false, bool $buildAtUp = false): void
{
    if ($buildAtUp) {
        sharedBuild($noCache, 'ci');
    }

    sharedUp($forceRecreate, $noCache, false, 'ci');
}
