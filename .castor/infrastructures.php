<?php

declare(strict_types=1);

namespace Local\Infrastructures;

use function Capco\Castor\compose;
use Castor\Attribute\AsTask;
use function Castor\run;

function ensureDockerIsRunning(): void
{
    if ('Darwin' === \PHP_OS_FAMILY) {
        run(['sh', '-c', 'if docker info >/dev/null 2>&1; then exit 0; fi; open -a Docker; attempt=0; while [ "$attempt" -lt 30 ]; do if docker info >/dev/null 2>&1; then exit 0; fi; attempt=$((attempt + 1)); sleep 2; done; echo "Docker Desktop did not become ready within 60 seconds." >&2; exit 1']);

        return;
    }

    run(['docker', 'info']);
}

#[AsTask(description: 'Build local Docker services.')]
function build(string $useCache = 'true', string $environment = 'local'): void
{
    ensureDockerIsRunning();

    $buildArguments = ['build'];

    if ('false' === $useCache) {
        $buildArguments[] = '--no-cache';
    }

    compose($buildArguments, $environment);
    compose(['pull'], $environment);
}

#[AsTask(description: 'Start local Docker services.')]
function up(string $forceRecreate = 'false', string $noCache = 'false', bool $buildAtUp = false, string $environment = 'local'): void
{
    ensureDockerIsRunning();

    if ($buildAtUp) {
        $buildArguments = ['build'];

        if ('true' === $noCache) {
            $buildArguments[] = '--no-cache';
        }

        compose($buildArguments, $environment);
    }

    $upArguments = ['up', '--remove-orphans', '-d'];

    if ('true' === $forceRecreate) {
        $upArguments[] = '--force-recreate';
    }

    compose($upArguments, $environment);
}

#[AsTask(description: 'Stop local Docker services.')]
function stop(string $environment = 'local'): void
{
    compose(['stop'], $environment);
}

#[AsTask(description: 'Restart local Docker services.')]
function reboot(string $environment = 'local'): void
{
    stop($environment);
    run(['sleep', '5']);
    up(environment: $environment);
}

#[AsTask(description: 'Remove local Docker services without volumes.')]
function destroy(string $environment = 'local', bool $removeImages = false): void
{
    ensureDockerIsRunning();

    $arguments = ['down', '--remove-orphans'];

    if ($removeImages) {
        $arguments[] = '--rmi';
        $arguments[] = 'all';
    }

    compose($arguments, $environment);
}

#[AsTask(description: 'Remove local Docker services and volumes.')]
function clean(): void
{
    ensureDockerIsRunning();

    compose(['down', '--remove-orphans', '-v']);
}

#[AsTask(description: 'Show local Docker service status.')]
function ps(): void
{
    compose(['ps']);
}

#[AsTask(description: 'Show local Docker service logs.')]
function logs(string $containers = ''): void
{
    $arguments = ['logs'];
    $containerNames = preg_split('/\s+/', trim($containers), -1, \PREG_SPLIT_NO_EMPTY);

    if (false !== $containerNames) {
        $arguments = [...$arguments, ...$containerNames];
    }

    compose($arguments);
}
