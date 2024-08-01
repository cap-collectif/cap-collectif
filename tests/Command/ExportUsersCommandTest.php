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

    public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports/users';
    public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export/users';
    public const EXPECTED_FILE_NAMES = [
        'users',
    ];
    public const FULL_SUFFIX = '.csv';
    public const COMMAND = 'capco:export:users';

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
