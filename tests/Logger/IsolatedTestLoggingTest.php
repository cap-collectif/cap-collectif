<?php

namespace Capco\Tests\Logger;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises real warning output in an isolated PHPUnit process and verifies bounded log persistence.
 */
final class IsolatedTestLoggingTest extends KernelTestCase
{
    public function testWarningsRemainAvailableWithoutBlockingAnIsolatedTest(): void
    {
        self::bootKernel();
        $container = self::getContainer();
        $logger = $container->get('logger');
        $marker = 'Isolated test logging ' . bin2hex(random_bytes(8));
        for ($index = 0; $index < 256; ++$index) {
            $logger->warning($marker . ' ' . str_repeat('warning ', 128));
        }

        $log = fopen($container->getParameter('kernel.logs_dir') . '/test.log', 'r');
        self::assertIsResource($log);

        try {
            fseek($log, -4096, \SEEK_END);
            $contents = stream_get_contents($log);
            self::assertIsString($contents);
            self::assertStringContainsString($marker, $contents);
        } finally {
            fclose($log);
        }
    }
}
