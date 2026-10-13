<?php

declare(strict_types=1);

namespace Local\System;

use Castor\Attribute\AsTask;
use function Castor\context;
use function Castor\io;
use function Castor\run;
use Symfony\Component\Process\ExecutableFinder;

#[AsTask(description: 'Check local prerequisites, pinned tool versions and Docker availability; report all failures before exiting.', aliases: ['doctor'])]
function doctor(): void
{
    $package = json_decode(file_get_contents('package.json') ?: '{}', true, 512, \JSON_THROW_ON_ERROR);
    $checks = [
        ['Git', ['git', '--version'], null],
        ['Docker CLI', ['docker', '--version'], null],
        ['Docker Compose', ['docker', 'compose', 'version'], null],
        ['Docker daemon', ['docker', 'info', '--format', '{{.ServerVersion}}'], null],
        ['Node.js', ['node', '--version'], trim(file_get_contents('.nvmrc') ?: '')],
        ['Corepack', ['corepack', '--version'], null],
        ['Yarn via Corepack', ['corepack', 'yarn', '--version'], str_replace('yarn@', '', (string) ($package['packageManager'] ?? ''))],
        ['Castor', ['castor', '--version'], trim(file_get_contents('.castor-version') ?: '')],
        ['mkcert', ['mkcert', '-version'], null],
        ['curl', ['curl', '--version'], null],
    ];

    if ('Darwin' === \PHP_OS_FAMILY) {
        $checks[] = ['Symfony CLI', ['symfony', '-V'], null];
    }

    $failures = [];

    foreach ($checks as [$label, $command, $expectedVersion]) {
        if (!doctorCheck($label, $command, $expectedVersion)) {
            $failures[] = $label;
        }
    }

    if ([] !== $failures) {
        throw new \RuntimeException('Local prerequisites are not ready: ' . implode(', ', $failures) . '. See doc/installation-locale.md.');
    }

    io()->success('All local prerequisites are ready.');
}

/** @param list<string> $command */
function doctorCheck(string $label, array $command, ?string $expectedVersion = null): bool
{
    if (null === (new ExecutableFinder())->find($command[0])) {
        io()->writeln(sprintf('<error>[MISSING] %s: executable "%s" not found in PATH.</error>', $label, $command[0]));

        return false;
    }

    try {
        $process = run($command, context: context()
            ->withAllowFailure()
            ->withQuiet()
            ->withTimeout(15)
            ->withEnvironment(['COREPACK_ENABLE_NETWORK' => '0', 'COREPACK_ENABLE_DOWNLOAD_PROMPT' => '0']));
    } catch (\Exception $exception) {
        io()->writeln(sprintf('<error>[ERROR] %s: %s</error>', $label, $exception->getMessage()));

        return false;
    }

    if (!$process->isSuccessful()) {
        $message = 'Docker daemon' === $label
            ? 'Docker is installed, but its daemon is stopped or inaccessible.'
            : 'Command failed: ' . implode(' ', $command);
        io()->writeln(sprintf('<error>[ERROR] %s: %s</error>', $label, $message));
        io()->text(trim((string) ($process->getErrorOutput() ?: $process->getOutput())));

        return false;
    }

    $output = trim((string) ($process->getOutput() ?: $process->getErrorOutput()));

    if (null !== $expectedVersion
        && ('' === $expectedVersion || !preg_match('/(?<![0-9.])v?' . preg_quote(ltrim($expectedVersion, 'v'), '/') . '(?![0-9.])/', $output))
    ) {
        io()->writeln(sprintf('<error>[VERSION] %s: expected %s, got %s.</error>', $label, $expectedVersion ?: 'a pinned version in the repository', $output));

        return false;
    }

    io()->writeln(sprintf('<info>[OK] %s: %s</info>', $label, strtok($output, "\n") ?: 'available'));

    return true;
}

#[AsTask(description: 'Configure local development virtual hosts.')]
function configureVhosts(string $mode = 'symfony_bin'): void
{
    $context = context()->toInteractive();

    if ('Darwin' === \PHP_OS_FAMILY && 'symfony_bin' === $mode) {
        run(['symfony', 'local:proxy:domain:attach', 'capco'], context: $context->withAllowFailure());
        run(
            'if grep \'"tld": "wip"\' "$HOME/.symfony5/proxy.json"; then sed -i.bak \'s/"tld": "wip"/"tld": "dev"/g\' "$HOME/.symfony5/proxy.json"; fi',
            context: $context->withAllowFailure(),
        );
    }

    $domains = [
        'capco.dev',
        'capco.prod',
        'capco.test',
        'capco.paris.fr',
        'assets.cap.co',
        'mail.cap.co',
        'kibana.cap.co',
        'rabbitmq.cap.co',
    ];

    run('echo "# Added by cap-collectif" | sudo tee -a /etc/hosts', context: $context);

    foreach ($domains as $domain) {
        $escapedDomain = escapeshellarg($domain);
        run(
            "if ! grep -F {$escapedDomain} /etc/hosts | grep -F 127.0.0.1 >/dev/null; then printf '127.0.0.1 %s\\n' {$escapedDomain} | sudo tee -a /etc/hosts; fi",
            context: $context,
        );
    }

    run('echo "# End of section" | sudo tee -a /etc/hosts', context: $context);
}

#[AsTask(description: 'Generate local TLS certificates with mkcert.')]
function generateSsl(): void
{
    if (\PHP_OS_FAMILY === 'Darwin') {
        run(['symfony', 'local:server:ca:install']);
    }

    $directory = 'infrastructure/services/local/nginx/ssl';
    $certificate = $directory . '/capco.pem';

    if (is_file($certificate)) {
        return;
    }

    run(['mkdir', '-p', $directory]);
    run(['mkcert', '-install']);
    run([
        'mkcert',
        '-cert-file', $directory . '/capco.crt',
        '-key-file', $directory . '/capco.key',
        '*.cap.co', 'capco.dev', '*.capco.dev', 'capco.prod', '*.capco.prod',
        'capco.test', '*.capco.test', 'capco.paris.fr',
    ]);
    run('cat ' . escapeshellarg($directory . '/capco.crt') . ' > ' . escapeshellarg($certificate) . ' && cat ' . escapeshellarg($directory . '/capco.key') . ' >> ' . escapeshellarg($certificate));
}

#[AsTask(description: 'Install the repository prepare-commit-msg hook.')]
function installGitHook(): void
{
    run(['cp', 'codemod/git_hooks/prepare-commit-msg', '.git/hooks/prepare-commit-msg']);
    run(['chmod', '755', '.git/hooks/prepare-commit-msg']);
}
