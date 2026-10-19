#!/usr/bin/env php
<?php

/**
 * Reset only the test feature flags, without booting Symfony.
 * Optional JSON overrides are validated before any Redis write.
 */
require_once __DIR__ . '/../../vendor/autoload.php';

use Capco\Tests\FeatureFlags\FeatureFlagsResetter;

try {
    $overrides = json_decode($argv[1] ?? '{}', false, 512, \JSON_THROW_ON_ERROR);
    if (!$overrides instanceof \stdClass) {
        throw new \InvalidArgumentException('Feature flag overrides must be a JSON object.');
    }

    $count = (new FeatureFlagsResetter())->reset((array) $overrides);
    echo sprintf("Success: %d test feature flags prepared.\n", $count);
} catch (\InvalidArgumentException|\JsonException $exception) {
    fwrite(\STDERR, $exception->getMessage() . "\n");

    exit(1);
}
