<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Command\LoadProdDataCommand;
use Doctrine\Persistence\ManagerRegistry;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Tester\CommandTester;

/**
 * @internal
 * @coversNothing
 */
class LoadProdDataCommandTest extends TestCase
{
    public function testForceOptionLoadsFixturesAndToggles(): void
    {
        $command = $this->createCommand();
        $commandTester = new CommandTester($command);

        self::assertTrue($command->getDefinition()->hasOption('force'));
        self::assertFalse($command->getDefinition()->getOption('force')->acceptValue());

        $commandTester->execute([
            '--force' => true,
            '--env' => 'test',
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertTrue($command->fixturesLoaded);
        self::assertTrue($command->togglesLoaded);
        self::assertSame('test', $command->fixturesEnvironment);
        self::assertSame('test', $command->togglesEnvironment);
        self::assertStringContainsString('Load prod data completed', $commandTester->getDisplay());
    }

    private function createCommand(): TestableLoadProdDataCommand
    {
        return new TestableLoadProdDataCommand(
            $this->createMock(ManagerRegistry::class)
        );
    }
}

class TestableLoadProdDataCommand extends LoadProdDataCommand
{
    public bool $fixturesLoaded = false;
    public bool $togglesLoaded = false;
    public ?string $fixturesEnvironment = null;
    public ?string $togglesEnvironment = null;

    public function __construct(ManagerRegistry $managerRegistry)
    {
        parent::__construct('capco:load-prod-data', $managerRegistry);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->addOption('env', null, InputOption::VALUE_REQUIRED, '', 'test');
    }

    protected function loadFixtures(OutputInterface $output, string $env = 'dev'): void
    {
        $this->fixturesLoaded = true;
        $this->fixturesEnvironment = $env;
    }

    protected function loadToggles(OutputInterface $output, string $env = 'dev'): void
    {
        $this->togglesLoaded = true;
        $this->togglesEnvironment = $env;
    }
}
