<?php

namespace Capco\Tests\FeatureFlags;

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
    }

    /** @param array<string, bool> $overrides */
    protected function setFeatureFlags(array $overrides): void
    {
        $changes = array_replace($this->featureFlagChanges, $overrides);
        FeatureFlagsExtension::reset(array_replace(static::featureFlagOverrides(), $changes));
        $this->featureFlagChanges = $changes;
    }
}
