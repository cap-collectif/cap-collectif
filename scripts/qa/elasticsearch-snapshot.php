<?php

declare(strict_types=1);

// Save or restore test snapshots inside the application container, without a task runner.
require __DIR__ . '/../../vendor/autoload.php';

use Symfony\Component\Process\Process;

/** @param null|array<string, mixed> $data */
function elasticsearchCurl(string $method, string $path, ?array $data = null, bool $allowNotFound = false): string
{
    $command = ['curl', '-fsS', '-X', $method, 'http://elasticsearch:9200' . $path];
    if (null !== $data) {
        $command = [...$command, '-H', 'Content-Type: application/json', '--data', json_encode($data, JSON_THROW_ON_ERROR)];
    }
    $process = new Process($command);
    $process->setTimeout(null);
    $process->run();
    if ($process->isSuccessful()) {
        return $process->getOutput();
    }
    if ($allowNotFound && 22 === $process->getExitCode() && str_contains($process->getErrorOutput(), 'returned error: 404')) {
        return '';
    }

    throw new RuntimeException($process->getErrorOutput() ?: 'The Elasticsearch request failed.');
}

function saveEsSnapshot(): void
{
    $shared = \in_array('--shared', $GLOBALS['argv'], true);
    $location = $shared ? '/usr/share/elasticsearch/ci-snapshots' : 'var';
    $indices = $shared ? 'capco_*,analytics_test' : 'capco';

    elasticsearchCurl('PUT', '/_snapshot/repository_qa', [
        'type' => 'fs',
        'settings' => ['location' => $location],
    ]);

    if (!$shared) {
        elasticsearchCurl('DELETE', '/_snapshot/repository_qa/snap_qa', allowNotFound: true);
    }

    $snapshot = json_decode(elasticsearchCurl('PUT', '/_snapshot/repository_qa/snap_qa?wait_for_completion=true', [
        'indices' => $indices,
        'include_global_state' => false,
        'feature_states' => ['none'],
    ]), true, 512, \JSON_THROW_ON_ERROR)['snapshot'];

    if ('SUCCESS' !== $snapshot['state'] || ($shared && !\in_array('analytics_test', $snapshot['indices'], true))) {
        throw new RuntimeException('The Elasticsearch test snapshot is incomplete.');
    }
}

function restoreEsSnapshot(bool $confirm, string $recoveryTask): void
{
    if (!$confirm) {
        throw new InvalidArgumentException('Elasticsearch restoration is destructive; pass --confirm.');
    }

    $shared = \in_array('--shared', $GLOBALS['argv'], true);
    $timed = static function (string $label, callable $operation) use ($shared): mixed {
        $startedAt = microtime(true);
        $result = $operation();

        if ($shared) {
            printf("CI_RESTORE_TIMING %s_ms=%d\n", $label, (int) round((microtime(true) - $startedAt) * 1000));
        }

        return $result;
    };

    if ($shared) {
        $timed('es_register_repository', static fn (): string => elasticsearchCurl('PUT', '/_snapshot/repository_qa', [
            'type' => 'fs',
            'settings' => ['location' => '/usr/share/elasticsearch/ci-snapshots', 'readonly' => true],
        ]));
    }

    $snapshotResponse = $timed('es_read_snapshot', static fn (): string => elasticsearchCurl('GET', '/_snapshot/repository_qa/snap_qa?pretty', allowNotFound: true));
    if ('' === $snapshotResponse) {
        throw new RuntimeException(sprintf('The Elasticsearch test snapshot is missing. Run %s first.', $recoveryTask));
    }

    $snapshot = json_decode((string) $snapshotResponse, true, 512, \JSON_THROW_ON_ERROR);
    $snapshots = $snapshot['snapshots'] ?? null;
    if (!\is_array($snapshots) || !\is_array($snapshots[0] ?? null)) {
        throw new RuntimeException(sprintf('The Elasticsearch test snapshot is missing or empty. Run %s first.', $recoveryTask));
    }

    $snapshotIndices = $snapshots[0]['indices'] ?? null;
    if (!\is_array($snapshotIndices)) {
        throw new RuntimeException('The Elasticsearch test snapshot does not contain any indices.');
    }

    $indices = array_values(array_filter(
        $snapshotIndices,
        static fn (mixed $index): bool => \is_string($index) && str_starts_with($index, 'capco_'),
    ));

    if ([] === $indices) {
        throw new RuntimeException('Could not identify the Elasticsearch index in snap_qa.');
    }

    if ($shared && !\in_array('analytics_test', $snapshotIndices, true)) {
        throw new RuntimeException('The shared Elasticsearch snapshot does not contain analytics_test.');
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
        throw new RuntimeException('The Elasticsearch snapshot restoration failed.');
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

try {
    match ($argv[1] ?? '') {
        'save' => saveEsSnapshot(),
        'restore' => restoreEsSnapshot(\in_array('--confirm', $argv, true), 'php scripts/qa/elasticsearch-snapshot.php save (with --shared in CI)'),
        default => throw new InvalidArgumentException('Usage: elasticsearch-snapshot.php save|restore [--shared] [--confirm]'),
    };
} catch (Throwable $error) {
    fwrite(STDERR, $error->getMessage() . "\n");

    exit(1);
}
