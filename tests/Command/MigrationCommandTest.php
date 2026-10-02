<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;

/**
 * @internal
 * @coversNothing
 * @phpunit-status non-compliant
 * @phpunit-reason Drops and rebuilds the configured database without local isolation or restoration; keep
 * this dedicated CI check separate from ordinary test runs.
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
        $this->runCommand($application, 'doctrine:schema:validate');
    }

    /**
     * @param array<string, bool> $arguments
     */
    private function runCommand(Application $application, string $command, array $arguments = []): void
    {
        $tester = new CommandTester($application->find($command));
        ob_start();

        try {
            $tester->execute($arguments, ['interactive' => false]);
        } finally {
            $directOutput = ob_get_clean();
        }

        self::assertSame(Command::SUCCESS, $tester->getStatusCode(), $tester->getDisplay() . $directOutput);
    }
}
