<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\CollectParticipantExporter;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Helper\TableSeparator;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Stopwatch\Stopwatch;

class ExportCollectParticipantsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    final public const CAPCO_EXPORT_COLLECT_STEP_PARTICIPANTS = 'capco:export:collect:participants';
    private const BATCH_SIZE = 1000;
    protected string $projectRootDir;

    public function __construct(
        ExportUtils $exportUtils,
        private readonly Manager $toggleManager,
        string $projectRootDir,
        private readonly CollectStepRepository $stepRepository,
        private readonly CollectParticipantExporter $stepParticipantExporter,
        private readonly ParticipantsFilePathResolver $filePathResolver,
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly Stopwatch $stopwatch,
        private readonly string $exportDirectory
    ) {
        parent::__construct($exportUtils);
        $this->projectRootDir = $projectRootDir;
    }

    /**
     * @throws \Exception
     */
    public function execute(InputInterface $input, OutputInterface $output): int
    {
        $style = new SymfonyStyle($input, $output);

        if (!$input->getOption('force') && !$this->toggleManager->isActive('export')) {
            $style->error('Please enable "export" feature to run this command');

            return 1;
        }

        $count = $this->stepRepository->count([]);

        if (0 === $count) {
            $style->error('No collect step found');

            return 0;
        }

        $style->writeln(sprintf('Found %d collect steps', $count));

        $style->note('Starting the export.');

        $this->stopwatch->start('export_participants', 'Memory usage - Execution time');
        $filesystem = $this->cleanTmpExportsFiles();
        $collectSteps = $this->stepRepository->getAllStepsByCollectStep();

        $tableSummary = (new Table($output))
            ->setHeaderTitle('Export Collect Step Participants')
            ->setStyle('box-double')
            ->setHeaders(['Step', 'Participant(s) exported'])
        ;

        $totalParticipants = 0;

        /** @var CollectStep $collectStep */
        foreach ($collectSteps as $collectStep) {
            $this->stepParticipantExporter->initializeStyle($style);

            $filePaths = $this->getFilePaths($collectStep);
            $participantsExported = $this->exportParticipantsByBatch($input, $collectStep, $output);

            $totalParticipants += $participantsExported;
            $tableSummary->addRows([[$collectStep->getTitle(), $participantsExported], new TableSeparator()]);

            $this->finalizeExportFiles($filesystem, $collectStep, $filePaths, $style, $input, $output);
        }

        $tableSummary->setFooterTitle('Total Participants: ' . $totalParticipants);
        $tableSummary->render();

        $eventInfo = $this->stopwatch->stop('export_participants')->__toString();
        $style->success(sprintf(
            "Command '%s' ended successfully. %s",
            self::CAPCO_EXPORT_COLLECT_STEP_PARTICIPANTS,
            $eventInfo
        ));

        return 0;
    }

    public function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setName(self::CAPCO_EXPORT_COLLECT_STEP_PARTICIPANTS)
            ->setDescription('Export collect step participants')
        ;
    }

    /**
     * @return array<string, string>
     */
    private function getFilePaths(CollectStep $step): array
    {
        return [
            'full' => $this->filePathResolver->getFullExportPath($step),
            'simplified' => $this->filePathResolver->getSimplifiedExportPath($step),
        ];
    }

    private function exportParticipantsByBatch(InputInterface $input, CollectStep $step, OutputInterface $output): int
    {
        $offset = 0;
        $countParticipants = 0;
        $append = false;
        $withHeaders = true;

        do {
            $participants = $this->userRepository->getCollectParticipants($step, $offset, self::BATCH_SIZE);

            if (empty($participants)) {
                break;
            }

            $countParticipants += \count($participants);

            $this->stepParticipantExporter->exportCollectParticipants(
                $step,
                $participants,
                $input->getOption('delimiter'),
                $withHeaders,
                $append,
                $output
            );

            $append = true;
            $withHeaders = false;
            $this->entityManager->clear();
            $offset += self::BATCH_SIZE;
        } while (self::BATCH_SIZE === \count($participants));

        return $countParticipants;
    }

    /**
     * @param array<string, string> $filePaths
     */
    private function finalizeExportFiles(
        Filesystem $filesystem,
        CollectStep $step,
        array $filePaths,
        SymfonyStyle $style,
        InputInterface $input,
        OutputInterface $output
    ): void {
        $tmpFullExport = $filePaths['full'] . '.tmp';
        $tmpSimplifiedExport = $filePaths['simplified'] . '.tmp';

        if (file_exists($tmpFullExport)) {
            $filesystem->rename($tmpFullExport, $filePaths['full'], true);
        }

        if (file_exists($tmpSimplifiedExport)) {
            $filesystem->rename($tmpSimplifiedExport, $filePaths['simplified'], true);
        }

        foreach ($filePaths as $type => $path) {
            $isSimplified = 'simplified' === $type;
            if (file_exists($path)) {
                $this->executeSnapshot(
                    $input,
                    $output,
                    $step->getType() . '/' . $this->filePathResolver->getFileName($step, $isSimplified)
                );
            }
        }
    }

    private function cleanTmpExportsFiles(): Filesystem
    {
        $finder = (new Finder())->files()->in($this->exportDirectory)->name('*.tmp');
        $filesystem = new Filesystem();

        foreach ($finder as $file) {
            $filesystem->remove($file->getRealPath());
        }

        return $filesystem;
    }
}
