<?php

namespace Capco\Tests\FeatureFlags;

use PHPUnit\Runner\AfterTestHook;
use PHPUnit\Runner\BeforeTestHook;

final class FeatureFlagsExtension implements BeforeTestHook, AfterTestHook
{
    public function executeBeforeTest(string $test): void
    {
        $class = $this->featureFlagTestClass($test);
        if (null !== $class) {
            self::reset($class::featureFlagOverrides());
        }
    }

    public function executeAfterTest(string $test, float $time): void
    {
        if (null !== $this->featureFlagTestClass($test)) {
            self::reset();
        }
    }

    /** @param array<string, bool> $overrides */
    public static function reset(array $overrides = []): void
    {
        (new FeatureFlagsResetter())->reset($overrides);
    }

    /** @return null|class-string<FeatureFlagsAwareTest> */
    private function featureFlagTestClass(string $test): ?string
    {
        $class = explode('::', $test, 2)[0];

        return is_a($class, FeatureFlagsAwareTest::class, true) ? $class : null;
    }
}
