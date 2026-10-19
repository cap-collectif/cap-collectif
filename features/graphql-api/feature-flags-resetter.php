#!/usr/bin/env php
<?php

/**
 * Reset only the test feature flags, without booting Symfony.
 * Optional JSON overrides are validated before any Redis write.
 */
require_once __DIR__ . '/../../vendor/autoload.php';

use Capco\AppBundle\Toggle\EnvironmentPresets;
use Capco\AppBundle\Toggle\Manager;
use Predis\Client;
use Qandidate\Toggle\Toggle;
use Qandidate\Toggle\ToggleCollection\PredisCollection;

try {
    $overrides = json_decode($argv[1] ?? '{}', false, 512, \JSON_THROW_ON_ERROR);
    if (!$overrides instanceof \stdClass) {
        throw new \InvalidArgumentException('Feature flag overrides must be a JSON object.');
    }

    $states = array_fill_keys(Manager::$toggles, false);
    foreach (EnvironmentPresets::TEST as $flagName) {
        $states[$flagName] = true;
    }
    foreach ($overrides as $flagName => $active) {
        if (!array_key_exists($flagName, $states) || !is_bool($active)) {
            throw new \InvalidArgumentException(sprintf('Unknown feature flag or non-boolean value: %s.', $flagName));
        }
        $states[$flagName] = $active;
    }

    $redisHost = getenv('SYMFONY_REDIS_HOST') ?: '127.0.0.1';
    $redisPort = getenv('SYMFONY_REDIS_PORT') ?: '6379';
    $redis = new Client(sprintf('tcp://%s:%s', $redisHost, $redisPort));
    $collection = new PredisCollection('testfeature_toggle', $redis);

    $values = [];
    foreach ($states as $flagName => $active) {
        $toggle = new Toggle($flagName, []);
        if ($active) {
            $toggle->activate(Toggle::ALWAYS_ACTIVE);
        } else {
            $toggle->deactivate();
        }
        // Use Qandidate's persisted format, restricted to the test flag namespace.
        $values[$collection->getNamespace() . '__TOGGLE__' . $flagName] = serialize($toggle);
    }

    // One atomic write: requests cannot observe the intermediate disabled preset.
    $redis->mset($values);
    echo sprintf("Success: %d test feature flags prepared.\n", count($states));
} catch (\InvalidArgumentException|\JsonException $exception) {
    fwrite(\STDERR, $exception->getMessage() . "\n");

    exit(1);
}
