<?php

declare(strict_types=1);

namespace Capco\Castor\Qa;

use function Capco\Castor\application;

function resetFeatureFlags(string $overrides = '{}'): void
{
    application('php features/graphql-api/feature-flags-resetter.php ' . escapeshellarg($overrides));
}

function saveDb(): void
{
    application('mysqldump --opt -h database -u root symfony > var/db.backup');
}

function restoreDb(bool $confirm = false): void
{
    if (!$confirm) {
        throw new \InvalidArgumentException('Database restoration is destructive; pass --confirm.');
    }

    if ('1' === getenv('CI_SHARED_TEST_DATA')) {
        application('bash .circleci/profile-mysql-restore.sh');

        return;
    }

    application('mysql -h database -u root symfony < var/db.backup');
}

function purgeRabbitmq(bool $confirm = false): void
{
    if (!$confirm) {
        throw new \InvalidArgumentException('RabbitMQ purge is destructive; pass --confirm.');
    }

    application('rabbitmqctl purge_queue elasticsearch_indexation --vhost=capco', 'root');
}

function phpspec(string $desc = 'false'): void
{
    if ('false' === $desc) {
        application('php -d memory_limit=-1 bin/phpspec run --no-code-generation');

        return;
    }

    application(sprintf('php -d memory_limit=-1 bin/phpspec describe %s', escapeshellarg($desc)));
}

function phpunit(string $filter = 'false', string $tests = 'false', string $logJunit = 'false', string $testsuite = 'default'): void
{
    $command = ['php', 'scripts/qa/phpunit.php', '--testsuite=' . $testsuite];
    foreach (['filter' => $filter, 'tests' => $tests, 'log-junit' => $logJunit] as $option => $value) {
        if ('false' !== $value) {
            $command[] = '--' . $option . '=' . $value;
        }
    }
    application(implode(' ', array_map('escapeshellarg', $command)));
}

function saveEsSnapshot(): void
{
    application('php scripts/qa/elasticsearch-snapshot.php save' . ('1' === getenv('CI_SHARED_TEST_DATA') ? ' --shared' : ''));
}

function restoreEsSnapshot(bool $confirm): void
{
    if (!$confirm) {
        throw new \InvalidArgumentException('Elasticsearch restoration is destructive; pass --confirm.');
    }
    application('php scripts/qa/elasticsearch-snapshot.php restore --confirm' . ('1' === getenv('CI_SHARED_TEST_DATA') ? ' --shared' : ''));
}
