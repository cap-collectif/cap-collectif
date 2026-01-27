#!/usr/bin/env php
<?php
/**
 * Fast helper to enable/disable feature flags directly in Redis
 * Avoids full Symfony boot for tests (~10ms vs ~800ms).
 */
require_once __DIR__ . '/../../vendor/autoload.php';

require_once __DIR__ . '/../../src/Capco/AppBundle/Toggle/Manager.php';

use Capco\AppBundle\Toggle\Manager;
use Predis\Client;
use Qandidate\Toggle\Toggle;
use Qandidate\Toggle\ToggleCollection\PredisCollection;

const ENABLE_ACTION = 'enable';
const DISABLE_ACTION = 'disable';

if ($argc < 3) {
    echo sprintf("Usage: %s <%s|%s> <feature_flag_name>\n", $argv[0], ENABLE_ACTION, DISABLE_ACTION);

    exit(1);
}

$action = $argv[1];
$featureFlagName = $argv[2];

if (!in_array($featureFlagName, Manager::$toggles, true)) {
    echo sprintf("Error: Feature flag '%s' does not exist.\n", $featureFlagName);
    echo sprintf("Available feature flags are defined in %s\n", Manager::class);

    exit(1);
}

$redisHost = getenv('SYMFONY_REDIS_HOST') ?: '127.0.0.1';
$redisPort = getenv('SYMFONY_REDIS_PORT') ?: '6379';
$redis = new Client(sprintf('tcp://%s:%s', $redisHost, $redisPort));

$featureFlag = new Toggle($featureFlagName, []);

if (ENABLE_ACTION === $action) {
    $featureFlag->activate(Toggle::ALWAYS_ACTIVE);
} elseif (DISABLE_ACTION === $action) {
    $featureFlag->deactivate();
} else {
    echo sprintf("Invalid action: %s. Use 'enable' or 'disable'\n", $action);

    exit(1);
}

$collection = new PredisCollection('testfeature_toggle', $redis);
$collection->set($featureFlagName, $featureFlag);

echo "Success\n";
