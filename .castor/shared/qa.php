<?php

declare(strict_types=1);

namespace Capco\Castor\Qa;

use function Capco\Castor\application;
use function Castor\capture;
use function Castor\context;
use function Castor\io;
use function Castor\run;

/** @param null|array<string, mixed> $data */
function elasticsearchCurl(string $method, string $path, ?array $data = null): string
{
    $command = ['docker', 'exec', 'capco_application_1', 'curl', '-fsS', '-X', $method, 'http://elasticsearch:9200' . $path];

    if (null !== $data) {
        $command[] = '-H';
        $command[] = 'Content-Type: application/json';
        $command[] = '--data';
        $command[] = json_encode($data, \JSON_THROW_ON_ERROR);
    }

    return capture($command);
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

function phpunit(string $filter = 'false', string $tests = 'false', string $logJunit = 'false'): void
{
    $command = 'php -d memory_limit=-1 bin/phpunit --configuration=phpunit.xml --color --testdox';

    if ('false' !== $filter) {
        $command .= ' --filter=' . escapeshellarg($filter);
    }

    if ('false' !== $tests) {
        foreach (preg_split('/\s+/', trim($tests), -1, \PREG_SPLIT_NO_EMPTY) ?: [] as $test) {
            $command .= ' ' . escapeshellarg($test);
        }
    }

    if ('false' !== $logJunit) {
        $command .= ' --log-junit=' . escapeshellarg($logJunit);
    }

    application($command);
}

function saveEsSnapshot(): void
{
    $shared = '1' === getenv('CI_SHARED_TEST_DATA');
    $location = $shared ? '/usr/share/elasticsearch/ci-snapshots' : 'var';
    $indices = $shared ? 'capco_*,analytics_test' : 'capco';

    elasticsearchCurl('PUT', '/_snapshot/repository_qa', [
        'type' => 'fs',
        'settings' => ['location' => $location],
    ]);

    if (!$shared) {
        run(
            ['docker', 'exec', 'capco_application_1', 'curl', '-fsS', '-XDELETE', 'http://elasticsearch:9200/_snapshot/repository_qa/snap_qa'],
            context: context()->withAllowFailure()->withQuiet(),
        );
    }

    $snapshot = json_decode(elasticsearchCurl('PUT', '/_snapshot/repository_qa/snap_qa?wait_for_completion=true', [
        'indices' => $indices,
        'include_global_state' => false,
        'feature_states' => ['none'],
    ]), true, 512, \JSON_THROW_ON_ERROR)['snapshot'];

    if ('SUCCESS' !== $snapshot['state'] || ($shared && !\in_array('analytics_test', $snapshot['indices'], true))) {
        throw new \RuntimeException('The Elasticsearch test snapshot is incomplete.');
    }
}

function restoreEsSnapshot(bool $confirm = false): void
{
    if (!$confirm) {
        throw new \InvalidArgumentException('Elasticsearch restoration is destructive; pass --confirm.');
    }

    $shared = '1' === getenv('CI_SHARED_TEST_DATA');
    $timed = static function (string $label, callable $operation) use ($shared): mixed {
        $startedAt = microtime(true);
        $result = $operation();

        if ($shared) {
            io()->writeln(sprintf('CI_RESTORE_TIMING %s_ms=%d', $label, (int) round((microtime(true) - $startedAt) * 1000)));
        }

        return $result;
    };

    if ($shared) {
        $timed('es_register_repository', static fn (): string => elasticsearchCurl('PUT', '/_snapshot/repository_qa', [
            'type' => 'fs',
            'settings' => ['location' => '/usr/share/elasticsearch/ci-snapshots', 'readonly' => true],
        ]));
    }

    $snapshot = json_decode((string) $timed('es_read_snapshot', static fn (): string => elasticsearchCurl('GET', '/_snapshot/repository_qa/snap_qa?pretty')), true, 512, \JSON_THROW_ON_ERROR);
    $indices = array_values(array_filter(
        $snapshot['snapshots'][0]['indices'],
        static fn (string $index): bool => str_starts_with($index, 'capco_'),
    ));

    if ([] === $indices) {
        throw new \RuntimeException('Could not identify the Elasticsearch index in snap_qa.');
    }

    if ($shared && !\in_array('analytics_test', $snapshot['snapshots'][0]['indices'], true)) {
        throw new \RuntimeException('The shared Elasticsearch snapshot does not contain analytics_test.');
    }

    sort($indices);
    $restoredIndex = end($indices);
    $restorePrefix = $shared ? 'capco_restore_' . date('YmdHis') . '_' : '';
    if (!$shared) {
        $timed('es_close_index', static fn (): string => elasticsearchCurl('POST', '/capco/_close'));
    }

    $restoreOptions = [
        'indices' => $shared ? $restoredIndex . ',analytics_test' : $restoredIndex,
        'ignore_unavailable' => !$shared,
        'include_global_state' => false,
        'include_aliases' => !$shared,
        'feature_states' => ['none'],
    ];
    if ($shared) {
        $restoreOptions['rename_pattern'] = '^capco_(.+)$';
        $restoreOptions['rename_replacement'] = $restorePrefix . 'capco_$1';

        $existingIndices = json_decode((string) $timed('es_list_indices', static fn (): string => elasticsearchCurl('GET', '/_cat/indices?format=json&h=index')), true, 512, \JSON_THROW_ON_ERROR);

        foreach ($existingIndices as $entry) {
            $index = $entry['index'] ?? null;

            if (!\is_string($index)
                || (!str_starts_with($index, 'capco_')
                    && !str_starts_with($index, 'capco_restore_')
                    && !str_starts_with($index, 'castor_restore_')
                    && 'analytics_test' !== $index)
            ) {
                continue;
            }

            $timed('es_delete_index', static fn (): string => elasticsearchCurl('DELETE', '/' . rawurlencode($index)));
        }
    }

    $restored = json_decode((string) $timed('es_restore_snapshot', static fn (): string => elasticsearchCurl('POST', '/_snapshot/repository_qa/snap_qa/_restore?wait_for_completion=true', $restoreOptions)), true, 512, \JSON_THROW_ON_ERROR);

    if (0 !== $restored['snapshot']['shards']['failed']) {
        throw new \RuntimeException('The Elasticsearch snapshot restoration failed.');
    }

    if (!$shared) {
        $timed('es_open_index', static fn (): string => elasticsearchCurl('POST', '/capco/_open'));
    }

    $targetIndex = $shared ? $restorePrefix . $restoredIndex : $restoredIndex;
    $timed('es_update_aliases', static fn (): string => elasticsearchCurl('POST', '/_aliases', [
        'actions' => [
            ['remove' => ['index' => '*', 'alias' => 'capco_indexing']],
            ['remove' => ['index' => '*', 'alias' => 'capco']],
            ['add' => ['index' => $targetIndex, 'alias' => 'capco_indexing', 'is_write_index' => true]],
            ['add' => ['index' => $targetIndex, 'alias' => 'capco', 'is_write_index' => true]],
        ],
    ]));
}
