<?php

namespace Capco\Tests\Manager;

use Capco\AppBundle\Manager\MediaManager;
use PHPUnit\Framework\TestCase;

/**
 * @covers
 *
 * @internal
 */
class MediaManagerTest extends TestCase
{
    /**
     * @dataProvider formatBytesProvider
     */
    public function testFormatBytes(int $bytes, string $expected): void
    {
        $actual = MediaManager::formatBytes($bytes);

        self::assertEquals($expected, $actual);
    }

    public function formatBytesProvider(): \Generator
    {
        yield [1, '1.0 O'];

        yield [2000, '2.0 Ko'];

        yield [2000000, '1.9 Mo'];

        yield [500000000, '476.8 Mo'];

        yield [50000000000, '46.6 Go'];

        yield [5000000000000, '4.5 To'];
    }
}
