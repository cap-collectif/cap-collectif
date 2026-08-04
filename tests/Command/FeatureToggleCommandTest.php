<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Toggle\Manager;
use Qandidate\Toggle\Context;
use Qandidate\Toggle\ContextFactory;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Tester\CommandTester;

/**
 * @internal
 * @coversNothing
 */
class FeatureToggleCommandTest extends KernelTestCase
{
    private Manager $featureManager;
    private Context $context;
    private bool $initialState;

    protected function setUp(): void
    {
        self::bootKernel();

        $featureManager = self::getContainer()->get(Manager::class);
        \assert($featureManager instanceof Manager);
        $this->featureManager = $featureManager;

        $contextFactory = self::getContainer()->get('qandidate.toggle.user_context_factory');
        \assert($contextFactory instanceof ContextFactory);
        $this->context = $contextFactory->createContext();
        $this->initialState = $this->isFeatureActive();
    }

    protected function tearDown(): void
    {
        $this->initialState
            ? $this->featureManager->activate(Manager::zipcode_at_register)
            : $this->featureManager->deactivate(Manager::zipcode_at_register);

        parent::tearDown();
    }

    public function testDisableActiveFeature(): void
    {
        $this->featureManager->activate(Manager::zipcode_at_register);

        $commandTester = $this->executeCommand('capco:toggle:disable');

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertFalse($this->isFeatureActive());
    }

    public function testEnableInactiveFeature(): void
    {
        $this->featureManager->deactivate(Manager::zipcode_at_register);

        $commandTester = $this->executeCommand('capco:toggle:enable');

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertTrue($this->isFeatureActive());
    }

    public function testEnableActiveFeatureIsIdempotent(): void
    {
        $this->featureManager->activate(Manager::zipcode_at_register);

        $commandTester = $this->executeCommand('capco:toggle:enable');

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertTrue($this->isFeatureActive());
        self::assertStringContainsString('already active', $commandTester->getDisplay());
    }

    public function testDisableInactiveFeatureIsIdempotent(): void
    {
        $this->featureManager->deactivate(Manager::zipcode_at_register);

        $commandTester = $this->executeCommand('capco:toggle:disable');

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertFalse($this->isFeatureActive());
        self::assertStringContainsString('already disabled', $commandTester->getDisplay());
    }

    /**
     * @dataProvider toggleCommands
     */
    public function testUnknownFeatureFails(string $commandName): void
    {
        $commandTester = $this->executeCommand($commandName, 'zipcode_at_registere');

        self::assertSame(1, $commandTester->getStatusCode());
        self::assertStringContainsString(
            "zipcode_at_registere feature toggle doesn't exist",
            $commandTester->getDisplay()
        );
    }

    /**
     * @return iterable<string, array{string}>
     */
    public function toggleCommands(): iterable
    {
        yield 'enable' => ['capco:toggle:enable'];
        yield 'disable' => ['capco:toggle:disable'];
    }

    private function executeCommand(
        string $commandName,
        string $toggle = Manager::zipcode_at_register
    ): CommandTester {
        $application = new Application(self::$kernel);
        $commandTester = new CommandTester($application->find($commandName));
        $commandTester->execute(['toggle' => $toggle]);

        return $commandTester;
    }

    private function isFeatureActive(): bool
    {
        return $this->featureManager
            ->getToggleManager()
            ->active(Manager::zipcode_at_register, $this->context)
        ;
    }
}
