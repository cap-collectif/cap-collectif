<?php

declare(strict_types=1);

namespace Capco\Castor\Infrastructures;

use function Capco\Castor\compose;
use function Castor\run;

function ensureDockerIsRunning(): void
{
    if ('Darwin' === \PHP_OS_FAMILY) {
        run(['sh', '-c', 'if docker info >/dev/null 2>&1; then exit 0; fi; open -a Docker; attempt=0; while [ "$attempt" -lt 30 ]; do if docker info >/dev/null 2>&1; then exit 0; fi; attempt=$((attempt + 1)); sleep 2; done; echo "Docker Desktop did not become ready within 60 seconds." >&2; exit 1']);

        return;
    }

    run(['docker', 'info']);
}

function build(bool $noCache = false, string $environment = 'local'): void
{
    ensureDockerIsRunning();

    $buildArguments = ['build'];

    if ($noCache) {
        $buildArguments[] = '--no-cache';
    }

    compose($buildArguments, $environment);
    compose(['pull'], $environment);
}

function up(bool $forceRecreate = false, bool $noCache = false, bool $buildAtUp = false, string $environment = 'local'): void
{
    ensureDockerIsRunning();

    if ($buildAtUp) {
        $buildArguments = ['build'];

        if ($noCache) {
            $buildArguments[] = '--no-cache';
        }

        compose($buildArguments, $environment);
    }

    $upArguments = ['up', '--remove-orphans', '-d'];

    if ($forceRecreate) {
        $upArguments[] = '--force-recreate';
    }

    compose($upArguments, $environment);
}

function stop(string $environment = 'local'): void
{
    compose(['stop'], $environment);
}

function recreate(bool $noCache = false): void
{
    build(noCache: $noCache);
    up(forceRecreate: true);
}

function restart(string $environment = 'local'): void
{
    compose(['restart'], $environment);
}

function down(string $environment = 'local'): void
{
    ensureDockerIsRunning();

    compose(['down', '--remove-orphans'], $environment);
}

function destroy(string $environment = 'local', bool $removeImages = false): void
{
    ensureDockerIsRunning();

    $arguments = ['down', '--remove-orphans', '--volumes'];

    if ($removeImages) {
        $arguments[] = '--rmi';
        $arguments[] = 'all';
    }

    compose($arguments, $environment);
}

function ps(): void
{
    compose(['ps']);
}

function logs(string $containers = ''): void
{
    $arguments = ['logs'];
    $containerNames = preg_split('/\s+/', trim($containers), -1, \PREG_SPLIT_NO_EMPTY);

    if (false !== $containerNames) {
        $arguments = [...$arguments, ...$containerNames];
    }

    compose($arguments);
}
