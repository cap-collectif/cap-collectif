<?php

namespace Capco\Tests\FeatureFlags;

use Capco\AppBundle\Toggle\EnvironmentPresets;
use Capco\AppBundle\Toggle\Manager;
use PHPUnit\Framework\TestCase;
use Predis\Client;
use Qandidate\Toggle\Toggle;
use Qandidate\Toggle\ToggleCollection\PredisCollection;
use Symfony\Component\Process\Process;

/**
 * @internal
 * @coversNothing
 * @phpunit-status compliant
 * @phpunit-reason Runs the real PHPUnit lifecycle against Redis, including deliberate failures and isolated processes.
 */
final class FeatureFlagsLifecycleTest extends TestCase
{
    private Client $redis;
    /** @var array<string, null|string> */
    private array $initialValues = [];
    private string $fixture;
    private string $unrelatedKey;

    protected function setUp(): void
    {
        $this->redis = new Client(sprintf(
            'tcp://%s:%s',
            getenv('SYMFONY_REDIS_HOST') ?: '127.0.0.1',
            getenv('SYMFONY_REDIS_PORT') ?: '6379'
        ));
        foreach (Manager::$toggles as $flag) {
            $key = 'testfeature_toggle__TOGGLE__' . $flag;
            $this->initialValues[$key] = $this->redis->get($key);
        }
        $this->unrelatedKey = 'devfeature_toggle__TOGGLE__phpunit_probe_' . bin2hex(random_bytes(8));
        $this->redis->set($this->unrelatedKey, 'unchanged');
        $this->fixture = sys_get_temp_dir() . '/FeatureFlagsProbe' . bin2hex(random_bytes(8)) . 'Test.php';
    }

    protected function tearDown(): void
    {
        try {
            foreach ($this->initialValues as $key => $value) {
                if (null === $value) {
                    $this->redis->del([$key]);
                } else {
                    $this->redis->set($key, $value);
                }
            }
            $this->redis->del([$this->unrelatedKey]);
        } finally {
            if (is_file($this->fixture)) {
                unlink($this->fixture);
            }
            parent::tearDown();
        }
    }

    /** @dataProvider outcomes */
    public function testLifecycleRestoresThePreset(string $outcome, bool $isolated, bool $successful): void
    {
        file_put_contents($this->fixture, $this->probeSource(true));
        FeatureFlagsExtension::reset(['calendar' => true, 'shield_mode' => false, 'public_api' => false]);
        $process = $this->runProbe($outcome, $isolated);

        self::assertSame($successful, $process->isSuccessful(), $process->getOutput() . $process->getErrorOutput());
        if ('setup failure' === $outcome || 'teardown failure' === $outcome || 'assertion failure' === $outcome) {
            self::assertStringContainsString($outcome, $process->getOutput());
        }
        $collection = new PredisCollection('testfeature_toggle', $this->redis);
        foreach (Manager::$toggles as $flag) {
            self::assertSame(
                \in_array($flag, EnvironmentPresets::TEST, true) ? Toggle::ALWAYS_ACTIVE : Toggle::INACTIVE,
                $collection->get($flag)?->getStatus(),
                $flag
            );
        }
        self::assertSame('unchanged', $this->redis->get($this->unrelatedKey));
    }

    /** @return iterable<string, array{string, bool, bool}> */
    public static function outcomes(): iterable
    {
        yield 'success and repeated execution' => ['success', false, true];
        yield 'assertion failure' => ['assertion failure', false, false];
        yield 'setup failure' => ['setup failure', false, false];
        yield 'teardown failure' => ['teardown failure', false, false];
        yield 'skip in setup' => ['skip', false, true];
        yield 'isolated success' => ['success', true, true];
        yield 'isolated failure' => ['assertion failure', true, false];
    }

    public function testUnmigratedTestsDoNotResetRedis(): void
    {
        file_put_contents($this->fixture, $this->probeSource(false));
        FeatureFlagsExtension::reset(['calendar' => false, 'public_api' => true]);
        $before = $this->redis->mget(array_keys($this->initialValues));
        $process = $this->runProbe('unmanaged', false);

        self::assertTrue($process->isSuccessful(), $process->getOutput() . $process->getErrorOutput());
        self::assertSame($before, $this->redis->mget(array_keys($this->initialValues)));
    }

    public function testProbeDetectsAMissingExtension(): void
    {
        file_put_contents($this->fixture, $this->probeSource(true));
        FeatureFlagsExtension::reset(['calendar' => true]);
        $process = $this->runProbe('success', false, false);

        self::assertSame(1, $process->getExitCode(), $process->getOutput() . $process->getErrorOutput());
        self::assertStringContainsString('Failed asserting that true is false.', $process->getOutput());
    }

    private function runProbe(string $outcome, bool $isolated, bool $extensionEnabled = true): Process
    {
        $root = \dirname(__DIR__, 2);
        $arguments = [\PHP_BINARY, $root . '/bin/phpunit', '--configuration', $root . '/phpunit.xml', '--do-not-cache-result'];
        if (!$extensionEnabled) {
            $arguments[] = '--no-extensions';
        }
        if ($isolated) {
            $arguments[] = '--process-isolation';
        }
        $arguments[] = '--repeat=2';
        $arguments[] = $this->fixture;
        $process = new Process($arguments, $root, ['CAPCO_FEATURE_FLAGS_PROBE' => $outcome]);
        $process->run();

        return $process;
    }

    private function probeSource(bool $managed): string
    {
        $declaration = $managed ? 'implements \\Capco\\Tests\\FeatureFlags\\FeatureFlagsAwareTest' : '';
        $class = pathinfo($this->fixture, \PATHINFO_FILENAME);
        $source = <<<'PHP'
            <?php

            use Capco\Tests\FeatureFlags\FeatureFlagsTrait;
            use PHPUnit\Framework\TestCase;
            use Predis\Client;
            use Qandidate\Toggle\Context;
            use Qandidate\Toggle\ToggleCollection\PredisCollection;
            use Qandidate\Toggle\ToggleManager;

            abstract class FeatureFlagsProbeParent extends TestCase
            {
                use FeatureFlagsTrait;

                public static function featureFlagOverrides(): array
                {
                    return ['calendar' => false];
                }
            }

            final class PROBE_CLASS extends FeatureFlagsProbeParent PROBE_DECLARATION
            {
                private ToggleManager $manager;

                public static function featureFlagOverrides(): array
                {
                    return array_replace(parent::featureFlagOverrides(), ['shield_mode' => true]);
                }

                protected function setUp(): void
                {
                    if ('unmanaged' === getenv('CAPCO_FEATURE_FLAGS_PROBE')) {
                        return;
                    }
                    $redis = new Client(sprintf('tcp://%s:%s', getenv('SYMFONY_REDIS_HOST') ?: '127.0.0.1', getenv('SYMFONY_REDIS_PORT') ?: '6379'));
                    $this->manager = new ToggleManager(new PredisCollection('testfeature_toggle', $redis));
                    self::assertFalse($this->manager->active('calendar', new Context()));
                    self::assertTrue($this->manager->active('shield_mode', new Context()));
                    self::assertTrue($this->manager->active('public_api', new Context()));
                    if ('setup failure' === getenv('CAPCO_FEATURE_FLAGS_PROBE')) {
                        $this->setFeatureFlags(['calendar' => true]);
                        throw new \RuntimeException('setup failure');
                    }
                    if ('skip' === getenv('CAPCO_FEATURE_FLAGS_PROBE')) {
                        $this->setFeatureFlags(['calendar' => true]);
                        self::markTestSkipped('deliberately skipped');
                    }
                }

                protected function tearDown(): void
                {
                    if ('teardown failure' === getenv('CAPCO_FEATURE_FLAGS_PROBE')) {
                        $this->setFeatureFlags(['calendar' => true]);
                        throw new \RuntimeException('teardown failure');
                    }
                    parent::tearDown();
                }

                public function testScenario(): void
                {
                    if ('unmanaged' === getenv('CAPCO_FEATURE_FLAGS_PROBE')) {
                        self::assertTrue(true);
                        return;
                    }
                    $this->setFeatureFlags(['public_api' => false]);
                    self::assertFalse($this->manager->active('calendar', new Context()));
                    $this->setFeatureFlags(['calendar' => true]);
                    self::assertTrue($this->manager->active('calendar', new Context()));
                    self::assertTrue($this->manager->active('shield_mode', new Context()));
                    self::assertFalse($this->manager->active('public_api', new Context()));
                    if ('assertion failure' === getenv('CAPCO_FEATURE_FLAGS_PROBE')) {
                        self::fail('assertion failure');
                    }
                }
            }
            PHP;

        return str_replace(['PROBE_CLASS', 'PROBE_DECLARATION'], [$class, $declaration], $source);
    }
}
