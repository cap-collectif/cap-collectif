<?php

namespace Capco\Tests\Controller\Api;

use Capco\AppBundle\Antivirus\AntivirusScanner;
use Capco\AppBundle\Controller\Api\MediasController;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Twig\MediaExtension;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;

/**
 * @internal
 * @coversNothing
 */
class MediasControllerTest extends KernelTestCase
{
    /**
     * @dataProvider maliciousHtmlFiles
     */
    public function testRejectsMaliciousHtmlUploads(string $filename): void
    {
        self::bootKernel();

        $mediaManager = static::getContainer()->get(MediaManager::class);
        \assert($mediaManager instanceof MediaManager);

        $controller = new MediasController(
            $mediaManager,
            $this->createStub(MediaExtension::class),
            $this->createStub(AntivirusScanner::class)
        );
        $controller->setContainer(static::getContainer());
        $file = new UploadedFile(
            __DIR__ . '/fixtures/' . $filename,
            $filename,
            'text/html',
            null,
            true
        );

        $response = $controller->postMediaAction(new Request([], [], [], [], ['file' => $file]));

        self::assertSame(400, $response->getStatusCode());
        self::assertJsonStringEqualsJsonString(
            '{"errorCode":"An error occured while validating uploaded file."}',
            (string) $response->getContent()
        );
    }

    public static function maliciousHtmlFiles(): \Generator
    {
        yield 'file without HTML extension' => ['stored_xss'];
        yield 'HTML file' => ['stored_xss.html'];
    }
}
