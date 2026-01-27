#!/usr/bin/env php
<?php
/**
 * Fast helper to reset all feature flags to the TEST environment default state.
 * Avoids full Symfony boot for tests (~10ms vs ~800ms).
 */
require_once __DIR__ . '/../../vendor/autoload.php';

require_once __DIR__ . '/../../src/Capco/AppBundle/Toggle/Manager.php';

require_once __DIR__ . '/../../src/Capco/AppBundle/Toggle/EnvironmentPresets.php';

use Capco\AppBundle\Toggle\EnvironmentPresets;
use Capco\AppBundle\Toggle\Manager;
use Predis\Client;
use Qandidate\Toggle\Toggle;
use Qandidate\Toggle\ToggleCollection\PredisCollection;

$redisHost = getenv('SYMFONY_REDIS_HOST') ?: '127.0.0.1';
$redisPort = getenv('SYMFONY_REDIS_PORT') ?: '6379';
$redis = new Client(sprintf('tcp://%s:%s', $redisHost, $redisPort));

$collection = new PredisCollection('testfeature_toggle', $redis);

// Step 1: Deactivate ALL feature flags
echo "Deactivating all feature flags...\n";
foreach (Manager::$toggles as $flagName) {
    $toggle = new Toggle($flagName, []);
    $toggle->deactivate();
    $collection->set($flagName, $toggle);
}

// Step 2: Activate feature flags for TEST environment
echo "Activating feature flags for TEST environment...\n";
$testFlags = array_merge(EnvironmentPresets::COMMON, EnvironmentPresets::TEST);

foreach ($testFlags as $flagName) {
    $toggle = new Toggle($flagName, []);
    $toggle->activate(Toggle::ALWAYS_ACTIVE);
    $collection->set($flagName, $toggle);
}

echo sprintf("Success: %d flags activated for TEST environment\n", count($testFlags));
