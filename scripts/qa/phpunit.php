<?php

declare(strict_types=1);

// Run selected PHPUnit files with the application's PHP runtime.
require __DIR__ . '/../../vendor/autoload.php';

use Symfony\Component\Process\Process;

/**
 * Build a selected suite with absolute paths so its configuration can live in /tmp.
 *
 * @param list<string> $tests
 */
function selectedPhpunitConfigurationXml(array $tests): string
{
    if ([] === $tests) {
        throw new InvalidArgumentException('The PHPUnit selection must not be empty.');
    }

    $configuration = new DOMDocument();
    if (!$configuration->load('phpunit.xml')) {
        throw new RuntimeException('Unable to read phpunit.xml.');
    }
    $configuration->documentElement->setAttribute('defaultTestSuite', 'Selected tests');
    // The CircleCI checkout may not be writable by the application UID.
    $paths = (new DOMXPath($configuration))->query(
        '/phpunit/@bootstrap | /phpunit/@cacheResultFile | /phpunit/@cacheDirectory'
        . ' | /phpunit/coverage//directory | /phpunit/coverage//file | /phpunit/coverage/report/*/@outputFile'
        . ' | /phpunit/coverage/report/*/@outputDirectory | /phpunit/logging/*/@outputFile'
        . ' | /phpunit/extensions/extension/@file',
    );
    foreach ($paths as $path) {
        if ('' !== $path->nodeValue && !str_starts_with($path->nodeValue, '/')) {
            $path->nodeValue = getcwd() . '/' . $path->nodeValue;
        }
    }
    $suites = $configuration->getElementsByTagName('testsuites')->item(0);
    if (!$suites instanceof DOMElement) {
        throw new RuntimeException('phpunit.xml must define testsuites.');
    }
    while ($suites->firstChild) {
        $suites->removeChild($suites->firstChild);
    }
    $suite = $configuration->createElement('testsuite');
    $suite->setAttribute('name', 'Selected tests');
    $suites->appendChild($suite);
    foreach (array_unique($tests) as $test) {
        if (!is_file($test) && !is_dir($test)) {
            throw new InvalidArgumentException(sprintf('PHPUnit selection does not exist: %s.', $test));
        }
        $element = $configuration->createElement(is_dir($test) ? 'directory' : 'file');
        $element->appendChild($configuration->createTextNode(realpath($test)));
        $suite->appendChild($element);
    }

    $xml = $configuration->saveXML();
    if (false === $xml) {
        throw new RuntimeException('Unable to serialize the selected PHPUnit configuration.');
    }

    return $xml;
}

$configuration = null;
$status = 1;

try {
    $options = [];
    for ($index = 1; $index < \count($argv); ++$index) {
        [$option, $value] = array_pad(explode('=', $argv[$index], 2), 2, null);
        if (!\in_array($option, ['--tests', '--filter', '--log-junit', '--testsuite'], true)) {
            throw new InvalidArgumentException('Unknown PHPUnit runner option: ' . $option);
        }
        $value ??= $argv[++$index] ?? null;
        $key = substr($option, 2);
        if (null === $value || str_starts_with((string) $value, '--') || isset($options[$key])) {
            throw new InvalidArgumentException('Supply each PHPUnit runner option once, with a value: ' . $option);
        }
        $options[$key] = $value;
    }
    $command = [PHP_BINARY, '-d', 'memory_limit=-1', 'bin/phpunit', '--color', '--testdox'];
    if (isset($options['tests'])) {
        $selection = preg_split('/\s+/', trim((string) $options['tests']), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $xml = selectedPhpunitConfigurationXml($selection);
        $configuration = tempnam(sys_get_temp_dir(), 'capco-phpunit-selected-');
        if (false === $configuration || false === file_put_contents($configuration, $xml)) {
            throw new RuntimeException('Unable to write the selected PHPUnit configuration.');
        }
        $command[] = '--configuration=' . $configuration;
        $command[] = '--testsuite=Selected tests';
    } else {
        $command[] = '--configuration=phpunit.xml';
        $command[] = '--testsuite=' . ($options['testsuite'] ?? 'default');
    }
    if (isset($options['filter'])) {
        $command[] = '--filter=' . $options['filter'];
    }
    $report = $options['log-junit'] ?? null;
    if (null !== $report) {
        $directory = \dirname((string) $report);
        if (!is_dir($directory) && !mkdir($directory, 0777, true) && !is_dir($directory)) {
            throw new RuntimeException('Unable to create the JUnit directory.');
        }
        if (file_exists($report) && !unlink($report)) {
            throw new RuntimeException('Unable to remove the previous JUnit report.');
        }
        $command[] = '--log-junit=' . $report;
    }
    $process = new Process($command);
    $process->setTimeout(null);
    $status = $process->run(static function (string $type, string $output): void {
        fwrite(Process::ERR === $type ? STDERR : STDOUT, $output);
    });
    if (null !== $report && (!is_file($report) || 0 === filesize($report))) {
        throw new RuntimeException('The JUnit report is missing or empty.');
    }
} catch (Throwable $error) {
    fwrite(STDERR, $error->getMessage() . "\n");
    $status = 1;
} finally {
    if (\is_string($configuration) && is_file($configuration)) {
        unlink($configuration);
    }
}

exit($status);
