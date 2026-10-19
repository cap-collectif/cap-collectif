<?php

namespace Capco\Tests\FeatureFlags;

interface FeatureFlagsAwareTest
{
    /** @return array<string, bool> */
    public static function featureFlagOverrides(): array;
}
