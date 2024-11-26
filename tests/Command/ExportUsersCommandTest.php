<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class ExportUsersCommandTest extends KernelTestCase
{
    use CommandTestTrait;

    final public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports/users';
    final public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export/users';
    final public const EXPECTED_FILE_NAMES = [
        'users',
    ];
    final public const FULL_SUFFIX = '.csv';
    final public const COMMAND = 'capco:export:users';

    protected function setUp(): void
    {
        self::bootKernel();
    }

    public function testCommand(): void
    {
        $this->emptyOutputDirectory();

        $actualOutputs = $this->executeCommand(self::COMMAND);

        $completedFileNames = self::getCompletedFileNames(self::FULL_SUFFIX);

        $this->assertOutputs($actualOutputs, $completedFileNames);
    }
}
