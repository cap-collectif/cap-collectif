<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Tester\CommandTester;

/**
 * @internal
 * @coversNothing
 */
class PopulateIndexCommandTest extends KernelTestCase
{
    private const COMMAND = 'capco:es:populate';

    private CommandTester $commandTester;
    private Manager $featureFlagManager;

    protected function setUp(): void
    {
        self::bootKernel();

        $application = new Application(self::$kernel);
        $command = $application->find(self::COMMAND);
        $this->commandTester = new CommandTester($command);

        $container = self::getContainer();
        $featureFlagManager = $container->get(Manager::class);
        \assert($featureFlagManager instanceof Manager);
        $this->featureFlagManager = $featureFlagManager;
    }

    public function testCommandFailsWhenIndexationFeatureIsDisabled(): void
    {
        $this->featureFlagManager->deactivate(Manager::indexation);

        $this->commandTester->execute([]);

        $this->assertSame(1, $this->commandTester->getStatusCode());

        $output = $this->commandTester->getDisplay();
        $this->assertStringContainsString('Please enable "indexation" feature to run this command', $output);
    }

    public function testCommandExecutesSuccessfullyWhenIndexationFeatureIsEnabled(): void
    {
        $this->featureFlagManager->activate(Manager::indexation);

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
        $this->featureFlagManager->activate(Manager::indexation);

        $this->commandTester->execute([
            'type' => 'proposal',
        ]);

        $this->assertSame(0, $this->commandTester->getStatusCode());

        $output = $this->commandTester->getDisplay();
        $this->assertStringContainsString('All the documents are LIVE!', $output);
    }

    public function testCommandAcceptsOffsetArgument(): void
    {
        $this->featureFlagManager->activate(Manager::indexation);

        $this->commandTester->execute([
            'offset' => 10,
        ]);

        $this->assertSame(0, $this->commandTester->getStatusCode());

        $output = $this->commandTester->getDisplay();
        $this->assertStringContainsString('All the documents are LIVE!', $output);
    }
}
