<?php

declare(strict_types=1);

namespace Capco\Castor\Qa;

use function Capco\Castor\application;
use function Castor\capture;
use function Castor\context;
use function Castor\io;
use function Castor\run;

/** @param null|array<string, mixed> $data */
function elasticsearchCurl(string $method, string $path, ?array $data = null, bool $allowNotFound = false): string
{
    $command = ['docker', 'exec', 'capco_application_1', 'curl', '-fsS', '-X', $method, 'http://elasticsearch:9200' . $path];

    if (null !== $data) {
        $command[] = '-H';
        $command[] = 'Content-Type: application/json';
        $command[] = '--data';
        $command[] = json_encode($data, \JSON_THROW_ON_ERROR);
    }

    if (!$allowNotFound) {
        return capture($command);
    }

    $process = run($command, context: context()->withAllowFailure()->withQuiet());
    if ($process->isSuccessful()) {
        return (string) $process->getOutput();
    }

    if (22 === $process->getExitCode() && str_contains((string) $process->getErrorOutput(), 'returned error: 404')) {
        return '';
    }

    throw new \RuntimeException(trim((string) ($process->getErrorOutput() ?: $process->getOutput())) ?: 'The Elasticsearch request failed.');
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

/**
 * Build a selected suite next to phpunit.xml so its relative paths keep their meaning.
 *
 * @param list<string> $tests
 */
function selectedPhpunitConfigurationXml(array $tests): string
{
    if ([] === $tests) {
        throw new \InvalidArgumentException('The PHPUnit selection must not be empty.');
    }

    $configuration = new \DOMDocument();
    if (!$configuration->load('phpunit.xml')) {
        throw new \RuntimeException('Unable to read phpunit.xml.');
    }
    $configuration->documentElement->setAttribute('defaultTestSuite', 'Selected tests');
    $suites = $configuration->getElementsByTagName('testsuites')->item(0);
    if (!$suites instanceof \DOMElement) {
        throw new \RuntimeException('phpunit.xml must define testsuites.');
    }
    while ($suites->firstChild) {
        $suites->removeChild($suites->firstChild);
    }
    $suite = $configuration->createElement('testsuite');
    $suite->setAttribute('name', 'Selected tests');
    $suites->appendChild($suite);
    foreach (array_unique($tests) as $test) {
        if (!is_file($test) && !is_dir($test)) {
            throw new \InvalidArgumentException(sprintf('PHPUnit selection does not exist: %s.', $test));
        }
        $element = $configuration->createElement(is_dir($test) ? 'directory' : 'file');
        $element->appendChild($configuration->createTextNode($test));
        $suite->appendChild($element);
    }

    $xml = $configuration->saveXML();
    if (false === $xml) {
        throw new \RuntimeException('Unable to serialize the selected PHPUnit configuration.');
    }

    return $xml;
}

/** @param list<string> $tests */
function selectedPhpunitConfiguration(array $tests): string
{
    // Castor's static runtime has no DOM extension; generate XML inside the PHP container.
    $xml = capture([
        'docker', 'exec', '-w', '/var/www', 'capco_application_1', 'php', '-r',
        'require ".castor/shared/qa.php"; echo \\Capco\\Castor\\Qa\\selectedPhpunitConfigurationXml(json_decode($argv[1], true, 512, JSON_THROW_ON_ERROR));',
        json_encode($tests, \JSON_THROW_ON_ERROR),
    ]);
    $path = tempnam(\dirname(__DIR__, 2), '.phpunit-selected-');
    if (false === $path) {
        throw new \RuntimeException('Unable to create the selected PHPUnit configuration.');
    }

    try {
        if (false === file_put_contents($path, $xml) || !chmod($path, 0644)) {
            throw new \RuntimeException('Unable to write the selected PHPUnit configuration.');
        }
    } catch (\Throwable $exception) {
        unlink($path);

        throw $exception;
    }

    return $path;
}

function phpunit(string $filter = 'false', string $tests = 'false', string $logJunit = 'false', string $testsuite = 'default'): void
{
    $selectedConfiguration = null;

    try {
        $selection = [];
        if ('false' !== $tests) {
            $selection = preg_split('/\s+/', trim($tests), -1, \PREG_SPLIT_NO_EMPTY) ?: [];
            if ([] === $selection) {
                throw new \InvalidArgumentException('The PHPUnit selection must not be empty.');
            }
            if (\count($selection) > 1) {
                $selectedConfiguration = selectedPhpunitConfiguration($selection);
            }
        }
        $configuration = null === $selectedConfiguration ? 'phpunit.xml' : escapeshellarg(basename($selectedConfiguration));
        $command = 'php -d memory_limit=-1 bin/phpunit --configuration=' . $configuration . ' --color --testdox';
        $command .= ' --testsuite=' . escapeshellarg(null === $selectedConfiguration ? $testsuite : 'Selected tests');
        if ('false' !== $filter) {
            $command .= ' --filter=' . escapeshellarg($filter);
        }
        if (1 === \count($selection)) {
            $command .= ' ' . escapeshellarg($selection[0]);
        }
        if ('false' !== $logJunit) {
            $command .= ' --log-junit=' . escapeshellarg($logJunit);
            $command = 'mkdir -p -- ' . escapeshellarg(\dirname($logJunit))
                . ' && rm -f -- ' . escapeshellarg($logJunit)
                . ' && ' . $command . ' && test -s ' . escapeshellarg($logJunit);
        }

        application($command);
    } finally {
        if (null !== $selectedConfiguration) {
            unlink($selectedConfiguration);
        }
    }
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

function restoreEsSnapshot(bool $confirm, string $recoveryTask): void
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

    $snapshotResponse = $timed('es_read_snapshot', static fn (): string => elasticsearchCurl('GET', '/_snapshot/repository_qa/snap_qa?pretty', allowNotFound: true));
    if ('' === $snapshotResponse) {
        throw new \RuntimeException(sprintf('The Elasticsearch test snapshot is missing. Run %s first.', $recoveryTask));
    }

    $snapshot = json_decode((string) $snapshotResponse, true, 512, \JSON_THROW_ON_ERROR);
    $snapshots = $snapshot['snapshots'] ?? null;
    if (!\is_array($snapshots) || !\is_array($snapshots[0] ?? null)) {
        throw new \RuntimeException(sprintf('The Elasticsearch test snapshot is missing or empty. Run %s first.', $recoveryTask));
    }

    $snapshotIndices = $snapshots[0]['indices'] ?? null;
    if (!\is_array($snapshotIndices)) {
        throw new \RuntimeException('The Elasticsearch test snapshot does not contain any indices.');
    }

    $indices = array_values(array_filter(
        $snapshotIndices,
        static fn (mixed $index): bool => \is_string($index) && str_starts_with($index, 'capco_'),
    ));

    if ([] === $indices) {
        throw new \RuntimeException('Could not identify the Elasticsearch index in snap_qa.');
    }

    if ($shared && !\in_array('analytics_test', $snapshotIndices, true)) {
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
