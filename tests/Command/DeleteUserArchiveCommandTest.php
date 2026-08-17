<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Entity\UserArchive;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Filesystem\Filesystem;

/**
 * @internal
 * @coversNothing
 */
class DeleteUserArchiveCommandTest extends DatabaseCommandTestCase
{
    private ?string $archivePath = null;

    protected function tearDown(): void
    {
        if (null !== $this->archivePath) {
            (new Filesystem())->remove($this->archivePath);
        }

        parent::tearDown();
    }

    public function testDeletesReadyArchiveRequestedMoreThanSevenDaysAgo(): void
    {
        $archiveRepository = $this->entityManager->getRepository(UserArchive::class);
        foreach ($archiveRepository->findAll() as $existingArchive) {
            if (null === $existingArchive->getDeletedAt()) {
                $existingArchive->setDeletedAt(new \DateTime());
            }
        }

        $user = $this->entityManager->getRepository(User::class)->find('userAdmin');
        self::assertInstanceOf(User::class, $user);

        $archiveFilename = 'delete-user-archive-test-' . bin2hex(random_bytes(8)) . '.zip';
        $archive = (new UserArchive())
            ->setUser($user)
            ->setRequestedAt((new \DateTime())->modify('-8 days'))
            ->setReady(true)
            ->setPath($archiveFilename)
        ;
        $this->entityManager->persist($archive);
        $this->entityManager->flush();

        $this->archivePath = __DIR__ . '/../../public/export/' . $archiveFilename;
        file_put_contents($this->archivePath, 'archive');
        self::assertFileExists($this->archivePath);

        $commandTester = $this->createCommandTester('capco:user_archives:delete');
        $commandTester->execute([]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString('1 archives to delete.', $commandTester->getDisplay());
        self::assertFileDoesNotExist($this->archivePath);
        self::assertNotNull($archive->getDeletedAt());
    }
}
