<?php

namespace Capco\Tests\FeatureFlags;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

trait FeatureFlagsTrait
{
    /** @var array<string, bool> */
    private array $featureFlagChanges = [];

    /** @return array<string, bool> */
    public static function featureFlagOverrides(): array
    {
        return [];
    }

    /** @before */
    protected function clearFeatureFlagChanges(): void
    {
        $this->featureFlagChanges = [];
        $this->resetFeatureFlagCache();
    }

    /** @param array<string, bool> $overrides */
    protected function setFeatureFlags(array $overrides): void
    {
        $changes = array_replace($this->featureFlagChanges, $overrides);
        FeatureFlagsExtension::reset(array_replace(static::featureFlagOverrides(), $changes));
        $this->featureFlagChanges = $changes;
        $this->resetFeatureFlagCache();
    }

    private function resetFeatureFlagCache(): void
    {
        if ($this instanceof KernelTestCase && null !== static::$kernel) {
            $manager = static::getContainer()->get(Manager::class);
            \assert($manager instanceof Manager);
            $manager->resetCache();
        }
    }
}
