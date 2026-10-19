<?php

namespace Capco\Tests\Command;

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
 * @phpunit-reason Exercises the real helper CLI and Redis state, restoring the flags after each test.
 */
class TestFeatureFlagsResetterTest extends TestCase
{
    private Client $redis;
    /** @var array<string, null|string> */
    private array $initialValues = [];
    private string $unrelatedKey;

    protected function setUp(): void
    {
        $host = getenv('SYMFONY_REDIS_HOST') ?: '127.0.0.1';
        $port = getenv('SYMFONY_REDIS_PORT') ?: '6379';
        $this->redis = new Client(sprintf('tcp://%s:%s', $host, $port));
        foreach (Manager::$toggles as $name) {
            $key = 'testfeature_toggle__TOGGLE__' . $name;
            $this->initialValues[$key] = $this->redis->get($key);
        }
        $this->unrelatedKey = 'devfeature_toggle__TOGGLE__resetter_test_' . bin2hex(random_bytes(8));
        $this->redis->set($this->unrelatedKey, 'unchanged');
    }

    protected function tearDown(): void
    {
        foreach ($this->initialValues as $key => $value) {
            if (null === $value) {
                $this->redis->del([$key]);
            } else {
                $this->redis->set($key, $value);
            }
        }
        $this->redis->del([$this->unrelatedKey]);
        parent::tearDown();
    }

    public function testNoArgumentsRestoresThePresetAfterDirtyFlags(): void
    {
        $this->runHelper('{"calendar":false,"shield_mode":true}')->mustRun();
        $this->runHelper()->mustRun();
        $this->assertPreset([]);
    }

    public function testBooleanOverridesAndUnrelatedKeys(): void
    {
        $this->runHelper('{"calendar":false,"shield_mode":true}')->mustRun();
        $this->assertPreset(['calendar' => false, 'shield_mode' => true]);
        self::assertSame('unchanged', $this->redis->get($this->unrelatedKey));
    }

    /** @dataProvider invalidOverrides */
    public function testInvalidInputDoesNotChangeAnyFlag(string $overrides): void
    {
        $this->runHelper('{"calendar":false}')->mustRun();
        $process = $this->runHelper($overrides);
        $process->run();
        self::assertFalse($process->isSuccessful());
        $this->assertPreset(['calendar' => false]);
    }

    /** @return iterable<string, array{string}> */
    public static function invalidOverrides(): iterable
    {
        yield 'malformed JSON' => ['{'];
        yield 'array instead of object' => ['[]'];
        yield 'unknown flag after a valid override' => ['{"calendar":true,"unknown_test_flag":false}'];
        yield 'non-boolean value' => ['{"calendar":"false"}'];
    }

    private function runHelper(?string $overrides = null): Process
    {
        $root = \dirname(__DIR__, 2);
        $arguments = [\PHP_BINARY, $root . '/features/graphql-api/feature-flags-resetter.php'];
        if (null !== $overrides) {
            $arguments[] = $overrides;
        }

        return new Process($arguments, $root);
    }

    /** @param array<string, bool> $overrides */
    private function assertPreset(array $overrides): void
    {
        $collection = new PredisCollection('testfeature_toggle', $this->redis);
        foreach (Manager::$toggles as $name) {
            $active = $overrides[$name] ?? \in_array($name, EnvironmentPresets::TEST, true);
            $toggle = $collection->get($name);
            self::assertNotNull($toggle, $name);
            self::assertSame($active ? Toggle::ALWAYS_ACTIVE : Toggle::INACTIVE, $toggle->getStatus(), $name);
        }
    }
}
