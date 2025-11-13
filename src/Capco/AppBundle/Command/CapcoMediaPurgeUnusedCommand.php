<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Service\MediaManager;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;

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

    protected function configure(): void
    {
        parent::configure();

        $this->addOption(
            name: 'force',
            shortcut: 'f',
            description: 'Deletes the files for real instead of just listing them.',
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Unused files purge');

        try {
            $this->purgeFilesWithoutMedia($io, $input->getOption('force'));
        } catch (\Throwable $e) {
            $io->error($e->getMessage());

            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    private function purgeFilesWithoutMedia(SymfonyStyle $io, bool $force = false): void
    {
        $io->text("Looking for files that don't have a Media database entry...");

        $this->finder
            ->in($this->projectRootDir . MediaManager::MEDIAS_PATH)
            ->files()
        ;

        $filesIndexedByName = [];
        foreach ($this->finder as $file) {
            // In the very rare but possible case that we find 2 files with the same name, we will require a human intervention
            if (\array_key_exists($file->getFilename(), $filesIndexedByName)) {
                throw new \RuntimeException('There are 2 files with the same name, please check it manually.');
            }

            $filesIndexedByName[$file->getFilename()] = $file;
        }

        $medias = $this->mediaRepository->findBy([
            'providerReference' => array_map(fn (SplFileInfo $file) => $file->getFilename(), $filesIndexedByName),
        ]);

        // we now remove all the files from the array that have an entry in the database
        // (unset function does not need to check if the key exists)
        foreach ($medias as $media) {
            unset($filesIndexedByName[$media->getProviderReference()]);
        }

        $removed = [];
        foreach ($filesIndexedByName as $file) {
            // safety check, in case the file has been deleted between the start of the function and now:
            if (!is_file($file->getRealPath())) {
                continue;
            }

            if ($force) {
                unlink($file->getRealPath());
            }
            $removed[] = [$file->getFilename()];
        }

        $count = \count($removed);
        if (0 === $count) {
            $io->info('No orphan files found.');

            return;
        }

        $this->endMessage($io, $force, $count);

        $io->table(['File name'], $removed);

        $this->endMessage($io, $force, $count);
    }

    private function endMessage(SymfonyStyle $io, bool $force, int $count): void
    {
        if ($force) {
            $io->success(sprintf('Deleted %d files from file-system', $count));
        } else {
            $io->info(sprintf('Found %d orphan files that could be deleted.', $count));
            $io->note('Use the --force (-f) option to delete the files from the file-system.');
        }
    }
}
