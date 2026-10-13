<?php

declare(strict_types=1);

namespace Capco\Castor;

use function Castor\context;
use function Castor\run;

/**
 * Return the Compose files for the requested execution environment.
 *
 * Docker Compose merges override files natively, so no generated YAML file is
 * needed.
 *
 * @return list<string>
 */
function composeFiles(string $environment): array
{
    $files = ['infrastructure/environments/base.yml'];

    if ('ci' === $environment) {
        $files[] = 'infrastructure/environments/testing.yml';

        return $files;
    }

    $files[] = 'infrastructure/environments/development.yml';

    if (\PHP_OS_FAMILY === 'Linux') {
        $files[] = 'infrastructure/environments/development_linux.yml';
    }

    return $files;
}

/**
 * Run a Docker Compose command with the project's environment files.
 *
 * @param list<string> $arguments
 */
function compose(array $arguments, string $environment = 'local'): void
{
    $command = ['docker', 'compose', '-p', 'capco'];

    foreach (composeFiles($environment) as $file) {
        $command[] = '-f';
        $command[] = $file;
    }

    $processContext = context();

    if ('local' === $environment
        && $processContext->supportsInteraction()
        && stream_isatty(\STDOUT)
        && stream_isatty(\STDERR)
    ) {
        $processContext = $processContext->withTty();
    }

    run([...$command, ...$arguments], context: $processContext);
}

/**
 * Run a shell command inside the application container.
 */
function application(string $command, string $user = 'capco', bool $interactive = false, string $directory = '/var/www'): void
{
    $dockerCommand = ['docker', 'exec', '-t'];

    if ($interactive) {
        $dockerCommand[] = '-i';
    }

    $dockerCommand[] = '-u';
    $dockerCommand[] = $user;
    $dockerCommand[] = '-w';
    $dockerCommand[] = $directory;
    $dockerCommand[] = 'capco_application_1';
    $dockerCommand[] = '/bin/bash';
    $dockerCommand[] = '-lc';
    $dockerCommand[] = $command;

    run($dockerCommand, context: $interactive ? context()->withTimeout(null)->withTty() : null);
}
