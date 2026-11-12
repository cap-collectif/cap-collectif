<?php

// Measure the exact prepare workspace paths without following symbolic links.

declare(strict_types=1);

use Symfony\Component\Process\Process;
use Symfony\Component\Yaml\Yaml;

require dirname(__DIR__, 2) . '/vendor/autoload.php';

chdir(dirname(__DIR__, 2));

try {
    // CircleCI shares job and step definitions through more than 128 aliases.
    $config = Yaml::parseFile('.circleci/config.yml', maxAliasesForCollections: 1024);
    $paths = null;
    foreach ($config['jobs']['prepare']['steps'] as $step) {
        if (isset($step['persist_to_workspace'])) {
            $paths = $step['persist_to_workspace']['paths'];

            break;
        }
    }
    if (!\is_array($paths) || !$paths) {
        throw new RuntimeException('The prepare workspace must declare explicit paths.');
    }

    $entries = [];
    $existing = [];
    foreach ($paths as $path) {
        // Keep measurements tied to literal paths inside the checkout.
        if (!\is_string($path) || preg_match('#(^/|(^|/)\.\.(/|$)|[\x00\r\n*?\[\]])#', $path)) {
            throw new RuntimeException('Workspace measurements require literal relative paths.');
        }
        $present = file_exists($path) || is_link($path);
        $entries[$path] = ['path' => $path, 'present' => $present, 'apparent_bytes' => 0];
        if ($present) {
            $existing[] = $path;
        }
    }

    $total = 0;
    if ($existing) {
        // One invocation counts shared hard links once across all declared paths.
        $process = new Process(array_merge(['du', '--bytes', '--summarize', '--total', '--'], $existing));
        $process->setTimeout(120)->mustRun();
        foreach (explode("\n", trim($process->getOutput())) as $line) {
            [$bytes, $path] = explode("\t", $line, 2);
            if ('total' === $path) {
                $total = (int) $bytes;
            } else {
                $entries[$path]['apparent_bytes'] = (int) $bytes;
            }
        }
    }

    $breakdown = [];
    foreach (['var', 'admin-next/.next'] as $path) {
        if (!is_dir($path) || is_link($path)) {
            continue;
        }
        $process = new Process(['du', '--bytes', '--max-depth=2', '--', $path]);
        $process->setTimeout(120)->mustRun();
        foreach (explode("\n", trim($process->getOutput())) as $line) {
            [$bytes, $directory] = explode("\t", $line, 2);
            $breakdown[] = ['path' => $directory, 'apparent_bytes' => (int) $bytes];
        }
    }

    $report = [
        'revision' => getenv('CIRCLE_SHA1') ?: null,
        'workflow_id' => getenv('CIRCLE_WORKFLOW_ID') ?: null,
        'job' => getenv('CIRCLE_JOB') ?: 'prepare',
        'measured_at' => gmdate('c'),
        'total_apparent_bytes' => $total,
        'paths' => array_values($entries),
        // Breakdown entries overlap and must not be added to the workspace total.
        'breakdown' => $breakdown,
    ];
    $destination = $argv[1] ?? '/tmp/workspace-metrics/prepare.json';
    $directory = \dirname($destination);
    if (!is_dir($directory) && !mkdir($directory, 0777, true) && !is_dir($directory)) {
        throw new RuntimeException('Unable to create the workspace metrics directory.');
    }
    if (false === file_put_contents($destination, json_encode($report, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR) . "\n")) {
        throw new RuntimeException('Unable to write the workspace metrics report.');
    }
    // CircleCI's persist/attach logs provide the actual compressed transfer sizes.
    echo 'CI_WORKSPACE_SIZE ' . json_encode($report, JSON_THROW_ON_ERROR) . "\n";
} catch (Throwable $error) {
    fwrite(STDERR, $error->getMessage() . "\n");

    exit(1);
}
