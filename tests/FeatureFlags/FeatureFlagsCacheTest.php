<?php

namespace Capco\Tests\FeatureFlags;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 * @phpunit-status compliant
 * @phpunit-reason Checks flag changes through the real Symfony manager after its cached value has been read.
 */
final class FeatureFlagsCacheTest extends KernelTestCase implements FeatureFlagsAwareTest
{
    use FeatureFlagsTrait;

    public static function featureFlagOverrides(): array
    {
        return [Manager::calendar => false];
    }

    public function testScenarioOverridesInvalidateTheExistingManagerCache(): void
    {
        self::bootKernel();
        $manager = self::getContainer()->get(Manager::class);
        self::assertInstanceOf(Manager::class, $manager);
        self::assertFalse($manager->isActive(Manager::calendar));

        $this->setFeatureFlags([Manager::calendar => true]);
        self::assertSame($manager, self::getContainer()->get(Manager::class));
        self::assertTrue($manager->isActive(Manager::calendar));

        $this->setFeatureFlags([Manager::calendar => false]);
        self::assertFalse($manager->isActive(Manager::calendar));
    }

    public function testOverridesCanBePreparedBeforeKernelBoot(): void
    {
        $this->setFeatureFlags([Manager::calendar => true]);
        self::bootKernel();
        $manager = self::getContainer()->get(Manager::class);
        self::assertInstanceOf(Manager::class, $manager);
        self::assertTrue($manager->isActive(Manager::calendar));
    }

    public function testRebootedKernelReadsTheScenarioOverrides(): void
    {
        self::bootKernel();
        $manager = self::getContainer()->get(Manager::class);
        self::assertInstanceOf(Manager::class, $manager);
        self::assertFalse($manager->isActive(Manager::calendar));
        $this->setFeatureFlags([Manager::calendar => true]);

        self::ensureKernelShutdown();
        self::bootKernel();
        $rebootedManager = self::getContainer()->get(Manager::class);
        self::assertInstanceOf(Manager::class, $rebootedManager);
        self::assertNotSame($manager, $rebootedManager);
        self::assertTrue($rebootedManager->isActive(Manager::calendar));
    }
}
