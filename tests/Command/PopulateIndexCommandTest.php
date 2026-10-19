<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Toggle\Manager;
use Capco\Tests\FeatureFlags\FeatureFlagsAwareTest;
use Capco\Tests\FeatureFlags\FeatureFlagsTrait;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Tester\CommandTester;

/**
 * @internal
 * @coversNothing
 * @phpunit-status non-compliant
 * @phpunit-reason Changes Elasticsearch contents without restoring their initial state in teardown.
 */
class PopulateIndexCommandTest extends KernelTestCase implements FeatureFlagsAwareTest
{
    use FeatureFlagsTrait;

    private const COMMAND = 'capco:es:populate';

    private CommandTester $commandTester;

    protected function setUp(): void
    {
        self::bootKernel();

        $application = new Application(self::$kernel);
        $command = $application->find(self::COMMAND);
        $this->commandTester = new CommandTester($command);
    }

    public function testCommandFailsWhenIndexationFeatureIsDisabled(): void
    {
        $this->setFeatureFlags([Manager::indexation => false]);

        $this->commandTester->execute([]);

        $this->assertSame(1, $this->commandTester->getStatusCode());

        $output = $this->commandTester->getDisplay();
        $this->assertStringContainsString('Please enable "indexation" feature to run this command', $output);
    }

    public function testCommandExecutesSuccessfullyWhenIndexationFeatureIsEnabled(): void
    {
        $this->setFeatureFlags([Manager::indexation => true]);

        $this->commandTester->execute([]);

        $output = $this->commandTester->getDisplay();

        $this->assertSame(0, $this->commandTester->getStatusCode(), sprintf('Command failed with output: %s', $output));

        $this->assertStringContainsString('Start indexing Elasticsearch', $output);
        $this->assertStringContainsString('Current index', $output);
        $this->assertStringContainsString('All the documents are LIVE!', $output);
        $this->assertStringContainsString('Populate Elasticsearch duration:', $output);
    }

    public function testCommandAcceptsTypeArgument(): void
    {
        $this->setFeatureFlags([Manager::indexation => true]);

        $this->commandTester->execute([
            'type' => 'proposal',
        ]);

        $this->assertSame(0, $this->commandTester->getStatusCode());

        $output = $this->commandTester->getDisplay();
        $this->assertStringContainsString('All the documents are LIVE!', $output);
    }

    public function testCommandAcceptsOffsetArgument(): void
    {
        $this->setFeatureFlags([Manager::indexation => true]);

        $this->commandTester->execute([
            'offset' => 10,
        ]);

        $this->assertSame(0, $this->commandTester->getStatusCode());

        $output = $this->commandTester->getDisplay();
        $this->assertStringContainsString('All the documents are LIVE!', $output);
    }
}
