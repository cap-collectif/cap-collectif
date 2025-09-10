<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Service\MediaManager;
use Doctrine\DBAL\Exception;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Finder\Finder;

#[AsCommand(
    name: 'capco:media:purge-unused',
    description: 'This command will purge unused media.',
)]
class CapcoMediaPurgeUnusedCommand extends Command
{
    public function __construct(
        private readonly string $projectRootDir,
        private readonly MediaRepository $mediaRepository,
        private readonly Finder $finder,
        ?string $name = null,
    ) {
        parent::__construct($name);
    }

    /**
     * Be careful, the first purge purgeMediasWithoutDatabaseRelation does net remove files
     * from the file-system, so it have to be done before purgeFilesWithoutMedia.
     */
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
            $this->purgeFilesWithoutMedia($io);
        } catch (\Throwable $e) {
            $io->error(sprintf('Could not remove file from disk: %s', $e->getMessage()));

            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    /**
     * @throws Exception
     */
    private function purgeMediasWithoutDatabaseRelation(SymfonyStyle $io): void
    {
        $io->info('Purging Media database entries without a database relation to another table');
        $deletedCount = $this->mediaRepository->deleteUnusedMedia();
        $io->success(sprintf('Deleted %d Media from database', $deletedCount));
    }

    private function purgeFilesWithoutMedia(SymfonyStyle $io): void
    {
        $io->info("Purging files that don't have a Media database entry");

        $deletedCount = 0;
        $this->finder
            ->in($this->projectRootDir . MediaManager::MEDIAS_PATH)
            ->files()
        ;

        $fileNames = [];
        foreach ($this->finder as $file) {
            $fileNames[] = $file->getFilename();
        }

        // In the very rare but possible case that we find 2 files with the same name, we will require a human intervention
        if (\count($fileNames) !== \count(array_unique($fileNames))) {
            throw new \RuntimeException('There are 2 files with the same name, please check it manually.');
        }

        $medias = $this->mediaRepository->findBy([
            'providerReference' => $fileNames,
        ]);

        // Be careful, the array_diff function will return the elements that are in the first array but not in the second array,
        // so the order of the arguments is very important, otherwise we would delete te wrong files
        $mediaReferences = array_map(fn (Media $media) => $media->getProviderReference(), $medias);
        $filesToRemove = array_diff($fileNames, $mediaReferences);

        foreach ($this->finder as $file) {
            if (\in_array($file->getFilename(), $filesToRemove, true)) {
                unlink($file->getRealPath());
                ++$deletedCount;
            }
        }

        $io->success(sprintf('Deleted %d files from file-system', $deletedCount));
    }
}
