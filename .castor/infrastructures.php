<?php

declare(strict_types=1);

namespace Local\Infrastructures;

use Capco\Castor\Infrastructures as Shared;
use Castor\Attribute\AsTask;

#[AsTask(description: 'Build local Docker services.')]
function build(bool $noCache = false, string $environment = 'local'): void
{
    Shared\build($noCache, $environment);
}

#[AsTask(description: 'Start local Docker services.', aliases: ['up'])]
function up(bool $forceRecreate = false, bool $noCache = false, bool $buildAtUp = false, string $environment = 'local'): void
{
    Shared\up($forceRecreate, $noCache, $buildAtUp, $environment);
}

#[AsTask(description: 'Stop local Docker services.', aliases: ['stop'])]
function stop(string $environment = 'local'): void
{
    Shared\stop($environment);
}

#[AsTask(description: 'Rebuild images and recreate local Docker services while preserving volumes.', aliases: ['recreate'])]
function recreate(bool $noCache = false): void
{
    Shared\recreate($noCache);
}

#[AsTask(description: 'Restart local Docker services without rebuilding or recreating them.', aliases: ['restart'])]
function restart(string $environment = 'local'): void
{
    Shared\restart($environment);
}

#[AsTask(description: 'Remove local Docker services and networks while preserving volumes.', aliases: ['down'])]
function down(string $environment = 'local'): void
{
    Shared\down($environment);
}

#[AsTask(description: 'Remove local Docker services, networks and volumes, including MySQL and Elasticsearch data.')]
function destroy(string $environment = 'local', bool $removeImages = false): void
{
    Shared\destroy($environment, $removeImages);
}

#[AsTask(description: 'Show local Docker service status.', aliases: ['ps'])]
function ps(): void
{
    Shared\ps();
}

#[AsTask(description: 'Show local Docker service logs.', aliases: ['logs'])]
function logs(string $containers = ''): void
{
    Shared\logs($containers);
}
