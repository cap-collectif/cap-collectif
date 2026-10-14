<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\VocalContributionRepository;
use Capco\AppBundle\Service\VocalContributionFilenameResolver;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;

class ExportVocalContributionsCommand extends Command
{
    public function __construct(
        private readonly VocalContributionRepository $repository,
        private readonly MediaProvider $mediaProvider,
        private readonly VocalContributionFilenameResolver $filenameResolver,
        private readonly EntityManagerInterface $entityManager
    ) {
        parent::__construct('capco:export:voice-messages');
    }

    protected function configure(): void
    {
        $this
            ->setDescription('Export vocal contributions as a ZIP archive.')
            ->addOption('filePath', null, InputOption::VALUE_REQUIRED, 'The destination archive path.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $filePath = $input->getOption('filePath');
        if (!\is_string($filePath) || '' === $filePath) {
            $output->writeln('<error>The archive path is required.</error>');

            return Command::INVALID;
        }

        $filesystem = new Filesystem();
        $filesystem->mkdir(\dirname($filePath));
        $zip = new \ZipArchive();
        if (true !== $zip->open($filePath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE)) {
            throw new \RuntimeException('Unable to create the vocal contributions archive.');
        }

        try {
            foreach ($this->repository->createQueryBuilder('v')->getQuery()->toIterable() as $vocalContribution) {
                $sourcePath = $this->mediaProvider->getPrivateVoiceMessagePath($vocalContribution->getMedia());
                if (!is_file($sourcePath) || !is_readable($sourcePath)) {
                    throw new \RuntimeException(sprintf('Vocal file is missing or unreadable: %s', $vocalContribution->getId()));
                }

                if (!$zip->addFile($sourcePath, $this->filenameResolver->resolve($vocalContribution))) {
                    throw new \RuntimeException(sprintf('Unable to add vocal file: %s', $vocalContribution->getId()));
                }

                $this->entityManager->clear();
            }
            if (!$zip->close()) {
                throw new \RuntimeException('Unable to finalize the vocal contributions archive.');
            }
        } catch (\Throwable $exception) {
            try {
                $zip->close();
            } catch (\Throwable) {
            }
            $filesystem->remove($filePath);

            throw $exception;
        }

        return Command::SUCCESS;
    }
}
