<?php

namespace CapcoTests\Command;

use Capco\AppBundle\Command\ExportVocalContributionsCommand;
use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\VocalContribution;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\VocalContributionRepository;
use Capco\AppBundle\Service\VocalContributionFilenameResolver;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\QueryBuilder;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\Filesystem\Filesystem;

/**
 * @internal
 * @covers \Capco\AppBundle\Command\ExportVocalContributionsCommand
 */
class ExportVocalContributionsCommandTest extends TestCase
{
    private string $directory;

    protected function setUp(): void
    {
        $this->directory = sys_get_temp_dir() . '/vocal-export-' . bin2hex(random_bytes(8));
        (new Filesystem())->mkdir($this->directory);
    }

    protected function tearDown(): void
    {
        (new Filesystem())->remove($this->directory);
    }

    public function testExportsFilesWithContributionIds(): void
    {
        $withEmail = (new VocalContribution())
            ->setId('contribution-with-email')
            ->setParticipant((new Participant())->setEmail('author@example.com'))
        ;
        $withoutEmail = (new VocalContribution())
            ->setId('anonymous-contribution')
        ;
        $firstPath = $this->directory . '/first.webm';
        $secondPath = $this->directory . '/second.ogg';
        file_put_contents($firstPath, 'first vocal');
        file_put_contents($secondPath, 'second vocal');

        $firstMedia = (new Media())
            ->setId('first-media')
            ->setContentType('audio/webm')
        ;
        $secondMedia = (new Media())
            ->setId('second-media')
            ->setContentType('audio/ogg')
        ;
        $withEmail->setMedia($firstMedia);
        $withoutEmail->setMedia($secondMedia);

        $query = $this->createMock(AbstractQuery::class);
        $query->expects(self::once())
            ->method('toIterable')
            ->willReturn((static function () use ($withEmail, $withoutEmail): iterable {
                yield $withEmail;
                yield $withoutEmail;
            })())
        ;
        $queryBuilder = $this->createMock(QueryBuilder::class);
        $queryBuilder->expects(self::once())
            ->method('getQuery')
            ->willReturn($query)
        ;
        $repository = $this->createMock(VocalContributionRepository::class);
        $repository->expects(self::once())
            ->method('createQueryBuilder')
            ->with('v')
            ->willReturn($queryBuilder)
        ;
        $mediaProvider = $this->createMock(MediaProvider::class);
        $mediaProvider->expects(self::exactly(2))
            ->method('getPrivateVoiceMessagePath')
            ->willReturnCallback(static fn (Media $media): string => match ($media->getId()) {
                'first-media' => $firstPath,
                'second-media' => $secondPath,
                default => throw new \LogicException('Unexpected media.'),
            })
        ;

        $archivePath = $this->directory . '/vocals_2026-10-13.zip';
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::exactly(2))->method('clear');
        $commandTester = new CommandTester(new ExportVocalContributionsCommand(
            $repository,
            $mediaProvider,
            new VocalContributionFilenameResolver(),
            $entityManager
        ));

        self::assertSame(0, $commandTester->execute(['--filePath' => $archivePath]));
        self::assertFileExists($archivePath);

        $archive = new \ZipArchive();
        self::assertTrue($archive->open($archivePath));
        self::assertSame([
            'contribution-with-email.webm',
            'anonymous-contribution.ogg',
        ], [
            $archive->getNameIndex(0),
            $archive->getNameIndex(1),
        ]);
        self::assertSame('first vocal', $archive->getFromName('contribution-with-email.webm'));
        self::assertSame('second vocal', $archive->getFromName('anonymous-contribution.ogg'));
        self::assertTrue($archive->close());
    }

    public function testRequiresAnArchivePath(): void
    {
        $repository = $this->createMock(VocalContributionRepository::class);
        $mediaProvider = $this->createMock(MediaProvider::class);
        $commandTester = new CommandTester(new ExportVocalContributionsCommand(
            $repository,
            $mediaProvider,
            new VocalContributionFilenameResolver(),
            $this->createStub(EntityManagerInterface::class)
        ));

        self::assertSame(2, $commandTester->execute([]));
        self::assertStringContainsString('archive path is required', $commandTester->getDisplay());
    }

    public function testRemovesPartialArchiveWhenAVocalFileIsMissing(): void
    {
        $vocal = (new VocalContribution())
            ->setId('missing-vocal')
            ->setMedia((new Media())->setId('missing-media'))
        ;
        $query = $this->createMock(AbstractQuery::class);
        $query->method('toIterable')->willReturn([$vocal]);
        $queryBuilder = $this->createMock(QueryBuilder::class);
        $queryBuilder->method('getQuery')->willReturn($query);
        $repository = $this->createMock(VocalContributionRepository::class);
        $repository->method('createQueryBuilder')->willReturn($queryBuilder);
        $mediaProvider = $this->createMock(MediaProvider::class);
        $mediaProvider->method('getPrivateVoiceMessagePath')->willReturn($this->directory . '/missing.webm');

        $archivePath = $this->directory . '/incomplete.zip';
        $commandTester = new CommandTester(new ExportVocalContributionsCommand(
            $repository,
            $mediaProvider,
            new VocalContributionFilenameResolver(),
            $this->createStub(EntityManagerInterface::class)
        ));

        $this->expectException(\RuntimeException::class);

        try {
            $commandTester->execute(['--filePath' => $archivePath]);
        } finally {
            self::assertFileDoesNotExist($archivePath);
        }
    }
}
