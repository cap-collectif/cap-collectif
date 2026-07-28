<?php

namespace Capco\Tests\Processor\UserArchive;

use Capco\AppBundle\Entity\UserArchive;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Processor\UserArchive\UserArchiveRequestProcessor;
use Capco\AppBundle\Repository\UserArchiveRepository;
use Swarrot\Broker\Message;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Finder\Finder;

/**
 * @internal
 * @coversNothing
 */
class UserArchiveRequestProcessorTest extends KernelTestCase
{
    /** @var string[] */
    private array $archivePaths = [];

    protected function tearDown(): void
    {
        foreach ($this->archivePaths as $path) {
            @unlink($path);
        }

        parent::tearDown();
    }

    /**
     * @dataProvider userArchives
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function testGeneratesTheExpectedPersonalDataArchive(string $archiveId, string $snapshot): void
    {
        self::bootKernel();

        $container = static::getContainer();
        $mailer = $this->createMock(MailerService::class);
        $mailer->expects(self::once())->method('createAndSendMessage');
        $container->set(MailerService::class, $mailer);
        $processor = $container->get(UserArchiveRequestProcessor::class);
        self::assertTrue(
            $processor->process(new Message(json_encode(['userArchiveId' => $archiveId], \JSON_THROW_ON_ERROR)), [])
        );

        $archive = $container->get(UserArchiveRepository::class)->find($archiveId);
        self::assertInstanceOf(UserArchive::class, $archive);
        self::assertTrue($archive->isReady());
        self::assertNotNull($archive->getPath());
        $archivePath = $container->getParameter('kernel.project_dir') . '/public/export/' . $archive->getPath();
        self::assertFileExists($archivePath);

        $this->archivePaths[] = $archivePath;
        $zip = new \ZipArchive();
        self::assertTrue($zip->open($archivePath));

        try {
            $snapshots = new Finder();
            $snapshots
                ->files()
                ->name('*.csv')
                ->in(__DIR__ . '/../../../__snapshots__/rgpd_user_archives/' . $snapshot)
            ;
            $expectedFiles = [];
            foreach ($snapshots as $file) {
                $actualContent = $zip->getFromName($file->getFilename());
                self::assertIsString($actualContent);
                self::assertSame($file->getContents(), $this->normalizeLocale($actualContent));
                $expectedFiles[] = $file->getFilename();
            }

            $actualCsvFiles = [];
            for ($index = 0; $index < $zip->numFiles; ++$index) {
                $filename = $zip->getNameIndex($index);
                if (false !== $filename && str_ends_with($filename, '.csv')) {
                    $actualCsvFiles[] = $filename;
                }
            }
            sort($expectedFiles);
            sort($actualCsvFiles);
            self::assertSame($expectedFiles, $actualCsvFiles);
        } finally {
            $zip->close();
        }
    }

    public static function userArchives(): \Generator
    {
        yield 'user1' => ['userArchive1', 'user1'];
        yield 'user5' => ['userArchive3', 'user5'];
    }

    private function normalizeLocale(string $content): string
    {
        return preg_replace('/\\?_locale=[a-z]{2}-[A-Z]{2}/', '', $content) ?? $content;
    }
}
