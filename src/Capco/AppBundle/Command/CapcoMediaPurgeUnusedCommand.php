<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\MediaRepository;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'capco:media:purge-unused',
    description: 'This command will purge unused media.',
)]
class CapcoMediaPurgeUnusedCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly MediaRepository $mediaRepository,
        private readonly MediaProvider $mediaProvider,
        ?string $name = null
    ) {
        parent::__construct($name);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Purging unused Media');

        try {
            $this->purgeMediasWithoutDatabaseRelation($io);
        } catch (\Throwable $e) {
            $io->error(sprintf('Could not remove media: %s', $e->getMessage()));

            return Command::FAILURE;
        }

        try {
            $this->purgeMediasWithoutFileSystemRelation($io);
        } catch (\Throwable $e) {
            $io->error(sprintf('Could not remove media: %s', $e->getMessage()));

            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    /**
     * @throws Exception
     */
    private function purgeMediasWithoutDatabaseRelation(SymfonyStyle $io): void
    {
        $io->info('Purging database-orphan Media entries');
        $deletedCount = $this->mediaRepository->deleteUnusedMedia();
        $io->success(sprintf('Deleted %d Media from database', $deletedCount));
    }

    private function purgeMediasWithoutFileSystemRelation(SymfonyStyle $io): void
    {
        $io->info('Purging file-system-orphan Media entries');

        // Fetching media that have the file-system provider (Capco\AppBundle\Provider\MediaProvider) from database
        $medias = $this->mediaRepository->findBy(['providerName' => MediaProvider::class]);

        $deletedCount = 0;
        foreach ($medias as $media) {
            if (!$this->mediaProvider->referenceFileExists($media)) {
                $this->em->remove($media);
                ++$deletedCount;
            }
        }

        $this->em->flush();
        $io->success(sprintf('Deleted %d media from file-system', $deletedCount));
    }
}
