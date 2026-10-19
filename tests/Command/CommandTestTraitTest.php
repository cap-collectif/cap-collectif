<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Filesystem\Filesystem;

/**
 * @internal
 * @coversNothing
 * @phpunit-status compliant
 * @phpunit-reason Checks export directory preparation and cleanup with an isolated temporary directory.
 */
final class CommandTestTraitTest extends KernelTestCase
{
    use CommandTestTrait;

    public const OUTPUT_DIRECTORY = '/tmp/capco-export-test-unused';
    public const EXPECTED_DIRECTORY = '/tmp/capco-export-test-unused';
    public const EXPECTED_FILE_NAMES = [];

    public function testExportCleanupCreatesAnInitiallyMissingDirectory(): void
    {
        $directory = sys_get_temp_dir() . '/capco-export-test-' . bin2hex(random_bytes(8));

        try {
            $this->emptyOutputDirectory($directory);
            self::assertDirectoryExists($directory);
            file_put_contents($directory . '/previous.csv', 'previous export');

            $this->emptyOutputDirectory($directory);

            self::assertFileDoesNotExist($directory . '/previous.csv');
        } finally {
            (new Filesystem())->remove($directory);
        }
    }
}
