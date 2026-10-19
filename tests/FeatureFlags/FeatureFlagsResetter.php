<?php

namespace Capco\Tests\FeatureFlags;

use Capco\AppBundle\Toggle\EnvironmentPresets;
use Capco\AppBundle\Toggle\Manager;
use Predis\Client;
use Qandidate\Toggle\Toggle;
use Qandidate\Toggle\ToggleCollection\PredisCollection;

final class FeatureFlagsResetter
{
    /** @param array<string, mixed> $overrides */
    public function reset(array $overrides = []): int
    {
        $states = array_fill_keys(Manager::$toggles, false);
        foreach (EnvironmentPresets::TEST as $flagName) {
            $states[$flagName] = true;
        }
        foreach ($overrides as $flagName => $active) {
            if (!\array_key_exists($flagName, $states) || !\is_bool($active)) {
                throw new \InvalidArgumentException(sprintf('Unknown feature flag or non-boolean value: %s.', $flagName));
            }
            $states[$flagName] = $active;
        }

        $redis = new Client(sprintf(
            'tcp://%s:%s',
            getenv('SYMFONY_REDIS_HOST') ?: '127.0.0.1',
            getenv('SYMFONY_REDIS_PORT') ?: '6379'
        ));
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

        return \count($states);
    }
}
