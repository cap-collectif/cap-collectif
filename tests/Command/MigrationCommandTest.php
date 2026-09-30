<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;

/**
 * @internal
 * @coversNothing
 */
class MigrationCommandTest extends KernelTestCase
{
    public function testMigrationsRunFromScratch(): void
    {
        self::bootKernel();
        $application = new Application(self::$kernel);

        $this->runCommand($application, 'doctrine:database:drop', [
            '--force' => true,
            '--if-exists' => true,
        ]);
        $this->runCommand($application, 'doctrine:database:create');
        $this->runCommand($application, 'doctrine:migrations:migrate');
    }

    /**
     * @param array<string, bool> $arguments
     */
    private function runCommand(Application $application, string $command, array $arguments = []): void
    {
        $tester = new CommandTester($application->find($command));
        $tester->execute($arguments, ['interactive' => false]);

        self::assertSame(Command::SUCCESS, $tester->getStatusCode(), $tester->getDisplay());
    }
}
