<?php

namespace Capco\Tests\Service;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\VocalContribution;
use Capco\AppBundle\Exception\VocalContributionUploadException;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\VocalContributionDurationResolver;
use Capco\AppBundle\Service\VocalContributionUploadService;
use Capco\AppBundle\Toggle\Manager as ToggleManager;
use Capco\AppBundle\Validator\Constraints\MaxVocalFolderSize;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * @internal
 * @covers \Capco\AppBundle\Service\VocalContributionUploadService
 */
class VocalContributionUploadServiceTest extends TestCase
{
    /** @var string[] */
    private array $files = [];
    private string $fixtureDirectory;
    private string $originalPath;
    private string $ffprobePath;

    protected function setUp(): void
    {
        parent::setUp();
        $this->originalPath = (string) getenv('PATH');
        $this->fixtureDirectory = sys_get_temp_dir() . '/vocal-upload-' . bin2hex(random_bytes(8));
        self::assertTrue(mkdir($this->fixtureDirectory));

        $this->ffprobePath = $this->fixtureDirectory . '/ffprobe';
        self::assertNotFalse(file_put_contents($this->ffprobePath, "#!/bin/sh\nprintf 'audio\\n10\\n'\n"));
        self::assertTrue(chmod($this->ffprobePath, 0755));
        $this->files[] = $this->ffprobePath;
        putenv('PATH=' . $this->fixtureDirectory . \PATH_SEPARATOR . $this->originalPath);
    }

    protected function tearDown(): void
    {
        foreach ($this->files as $file) {
            if (file_exists($file)) {
                unlink($file);
            }
        }
        rmdir($this->fixtureDirectory);
        putenv('PATH=' . $this->originalPath);
        parent::tearDown();
    }

    public function testPersistsAnAuthenticatedVocalContribution(): void
    {
        $path = $this->createFile(1024, 'audio');
        $file = $this->createMock(UploadedFile::class);
        $file->method('getError')->willReturn(\UPLOAD_ERR_OK);
        $file->method('getSize')->willReturn(1024);
        $file->method('isValid')->willReturn(true);
        $file->method('getMimeType')->willReturn('audio/webm');
        $file->method('getPathname')->willReturn($path);
        $file->method('guessExtension')->willReturn('webm');

        $media = (new Media())->setContentType('audio/webm');
        $mediaManager = $this->createMock(MediaManager::class);
        $mediaManager->expects(self::once())
            ->method('validateUploadedFile')
            ->with($file, ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'video/webm', 'video/mp4'], self::isInstanceOf(MaxVocalFolderSize::class))
        ;
        $mediaManager->expects(self::once())
            ->method('createFileFromUploadedFile')
            ->with(
                self::isInstanceOf(UploadedFile::class),
                Media::VOCAL_CONTRIBUTION_CONTEXT,
                null,
                'Anonyme',
                false
            )
            ->willReturn($media)
        ;

        $connection = $this->createMock(Connection::class);
        $connection->expects(self::once())->method('beginTransaction');
        $connection->expects(self::once())->method('commit');
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::exactly(2))->method('getConnection')->willReturn($connection);
        $entityManager->expects(self::once())->method('persist')->with(self::isInstanceOf(VocalContribution::class));
        $entityManager->expects(self::once())->method('flush');

        $toggleManager = $this->createStub(ToggleManager::class);
        $toggleManager->method('isActive')->willReturn(true);
        $collectStepRepository = $this->createStub(CollectStepRepository::class);
        $collectStepRepository->method('findVocalContributionStep')->willReturn(new CollectStep());
        $user = new User();
        $service = new VocalContributionUploadService(
            $mediaManager,
            $this->createStub(MediaProvider::class),
            $entityManager,
            $this->createStub(ParticipantHelper::class),
            $toggleManager,
            new VocalContributionDurationResolver(),
            $collectStepRepository,
            '10M'
        );

        $contribution = $service->upload($file, $user, null);

        self::assertSame($media, $contribution->getMedia());
        self::assertSame($user, $contribution->getUser());
        self::assertSame(10, $media->getLength());
    }

    public function testRejectsFilesLargerThanConfiguredLimitWith413(): void
    {
        $path = $this->createFile(10 * 1024 * 1024 + 1);

        $this->assertUploadRejected(
            new UploadedFile($path, 'voice.webm', null, \UPLOAD_ERR_OK, true),
            413
        );
    }

    public function testAcceptsUploadWhenDurationProbeTimesOut(): void
    {
        self::assertNotFalse(file_put_contents($this->ffprobePath, "#!/bin/sh\nsleep 4\n"));
        $path = $this->createFile(1024, 'audio');
        $file = $this->createMock(UploadedFile::class);
        $file->method('getError')->willReturn(\UPLOAD_ERR_OK);
        $file->method('getSize')->willReturn(1024);
        $file->method('isValid')->willReturn(true);
        $file->method('getMimeType')->willReturn('audio/webm');
        $file->method('getPathname')->willReturn($path);
        $file->method('guessExtension')->willReturn('webm');

        $media = (new Media())->setContentType('audio/webm');
        $mediaManager = $this->createMock(MediaManager::class);
        $mediaManager->expects(self::once())->method('validateUploadedFile');
        $mediaManager->expects(self::once())
            ->method('createFileFromUploadedFile')
            ->willReturn($media)
        ;
        $connection = $this->createMock(Connection::class);
        $connection->expects(self::once())->method('beginTransaction');
        $connection->expects(self::once())->method('commit');
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::exactly(2))->method('getConnection')->willReturn($connection);
        $entityManager->expects(self::once())->method('persist')->with(self::isInstanceOf(VocalContribution::class));
        $entityManager->expects(self::once())->method('flush');
        $toggleManager = $this->createStub(ToggleManager::class);
        $toggleManager->method('isActive')->willReturn(true);
        $collectStepRepository = $this->createStub(CollectStepRepository::class);
        $collectStepRepository->method('findVocalContributionStep')->willReturn(new CollectStep());
        $service = new VocalContributionUploadService(
            $mediaManager,
            $this->createStub(MediaProvider::class),
            $entityManager,
            $this->createStub(ParticipantHelper::class),
            $toggleManager,
            new VocalContributionDurationResolver(),
            $collectStepRepository,
            '10M'
        );

        $contribution = $service->upload($file, new User(), null);

        self::assertSame($media, $contribution->getMedia());
        self::assertNull($media->getLength());
    }

    public function testRejectsUnsupportedMimeTypesWith415(): void
    {
        $path = $this->createFile(1024, 'not an audio file');

        $this->assertUploadRejected(
            new UploadedFile($path, 'voice.webm', null, \UPLOAD_ERR_OK, true),
            415
        );
    }

    private function assertUploadRejected(UploadedFile $file, int $expectedStatus): void
    {
        try {
            $this->service()->upload($file, null, null);
            self::fail('The upload should have been rejected.');
        } catch (VocalContributionUploadException $exception) {
            self::assertSame('INVALID_VOICE_MESSAGE', $exception->errorCode);
            self::assertSame($expectedStatus, $exception->statusCode);
        }
    }

    private function service(): VocalContributionUploadService
    {
        $toggleManager = $this->createStub(ToggleManager::class);
        $toggleManager->method('isActive')->willReturn(true);

        return new VocalContributionUploadService(
            $this->createMock(MediaManager::class),
            $this->createStub(MediaProvider::class),
            $this->createStub(EntityManagerInterface::class),
            $this->createStub(ParticipantHelper::class),
            $toggleManager,
            new VocalContributionDurationResolver(),
            $this->createStub(CollectStepRepository::class),
            '10M'
        );
    }

    private function createFile(int $size, string $contents = ''): string
    {
        $path = tempnam(sys_get_temp_dir(), 'vocal-upload-');
        self::assertNotFalse($path);
        $this->files[] = $path;

        if ('' !== $contents) {
            file_put_contents($path, $contents);
        } else {
            if ($size < 0) {
                throw new \InvalidArgumentException('The file size must be positive.');
            }

            $handle = fopen($path, 'w');
            self::assertIsResource($handle);
            ftruncate($handle, $size);
            fclose($handle);
        }

        return $path;
    }
}
