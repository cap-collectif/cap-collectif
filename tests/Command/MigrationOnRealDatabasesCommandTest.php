<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Command\Migrations\MigrationOnRealDatabasesCommand;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

/**
 * @internal
 * @coversNothing
 */
class MigrationOnRealDatabasesCommandTest extends TestCase
{
    public function testImportFailureReportsDetailsWithoutTheKey(): void
    {
        $key = "secret'key";
        $process = new Process([\PHP_BINARY, '-r', 'fwrite(STDERR, "Import rejected: " . $argv[1]); exit(42);', $key]);
        $process->run();
        $command = $this->getMockBuilder(MigrationOnRealDatabasesCommand::class)
            ->setConstructorArgs([sys_get_temp_dir()])
            ->onlyMethods(['checkDatabase'])
            ->getMock()
        ;
        $command->expects(self::once())->method('checkDatabase')->willThrowException(new ProcessFailedException($process));
        $tester = new CommandTester($command);

        self::assertSame(1, $tester->execute(['--key' => $key], ['interactive' => false]));
        self::assertStringContainsString('SQL import failed (exit 42)', $tester->getDisplay());
        self::assertStringContainsString('Import rejected: [REDACTED]', $tester->getDisplay());
        self::assertStringNotContainsString('secret', $tester->getDisplay());
    }

    public function testSubprocessFailureIsPropagated(): void
    {
        $command = new MigrationOnRealDatabasesCommand(sys_get_temp_dir());
        $method = new \ReflectionMethod($command, 'launchCommand');
        $method->setAccessible(true);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('failed (exit 42)');
        $method->invoke($command, sys_get_temp_dir(), [\PHP_BINARY, '-r', 'exit(42);']);
    }

    public function testFailureRemovesDecryptedFilesAndFailsTheCommand(): void
    {
        $directory = sys_get_temp_dir() . '/migration-test-' . bin2hex(random_bytes(8));
        $filesystem = new Filesystem();
        $filesystem->mkdir($directory . '/databases');
        $sql = $directory . '/databases/p.sql';
        $filesystem->touch([$sql, $sql . '.gz', $sql . '.gzip.enc']);

        try {
            $command = $this->getMockBuilder(MigrationOnRealDatabasesCommand::class)
                ->setConstructorArgs([$directory])
                ->onlyMethods(['launchCommand'])
                ->getMock()
            ;
            $command->expects(self::once())->method('launchCommand')
                ->willThrowException(new \RuntimeException('openssl failed (exit 42): bad decrypt secret-key'))
            ;

            $tester = new CommandTester($command);
            self::assertSame(1, $tester->execute(['--key' => 'secret-key'], ['interactive' => false]));
            self::assertStringContainsString('Migration check failed.', $tester->getDisplay());
            self::assertStringContainsString('openssl failed (exit 42): bad decrypt [REDACTED]', $tester->getDisplay());
            self::assertStringNotContainsString('secret-key', $tester->getDisplay());
            self::assertFileDoesNotExist($sql);
            self::assertFileDoesNotExist($sql . '.gz');
            self::assertFileExists($sql . '.gzip.enc');
        } finally {
            $filesystem->remove($directory);
        }
    }
}
