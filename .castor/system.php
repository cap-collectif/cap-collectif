<?php

declare(strict_types=1);

namespace Local\System;

use Castor\Attribute\AsTask;
use function Castor\context;
use function Castor\run;

#[AsTask(description: 'Display the versions of local development tools.')]
function doctor(): void
{
    run(['docker', '--version']);
    run(['docker', 'compose', 'version']);
    run(['node', '--version']);
    run(['yarn', '--version']);

    if ('Darwin' === \PHP_OS_FAMILY) {
        run(['php', '--version']);
        run(['composer', '--version']);
        run(['symfony', '-V']);
        run(['sh', '-c', 'php -m | grep -qi redis && echo "PHP extension: redis enabled" || echo "PHP extension: redis not found"']);
        run(['sh', '-c', 'php -m | grep -qi imagick && echo "PHP extension: imagick enabled" || echo "PHP extension: imagick not found"']);
        run(['sh', '-c', 'php -m | grep -qi amqp && echo "PHP extension: amqp enabled" || echo "PHP extension: amqp not found"']);
    }
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
