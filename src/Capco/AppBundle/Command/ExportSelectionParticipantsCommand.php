<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Command\Service\SelectionParticipantExporter;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
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

class ExportSelectionParticipantsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    public const CAPCO_EXPORT_SELECTION_STEP_PARTICIPANTS = 'capco:export:selection:participants';
    private const BATCH_SIZE = 1000;
    protected string $projectRootDir;

    private bool $append = false;

    public function __construct(
        ExportUtils $exportUtils,
        private readonly Manager $toggleManager,
        string $projectRootDir,
        private readonly SelectionStepRepository $selectionStepRepository,
        private readonly SelectionParticipantExporter $selectionParticipantExporter,
        private readonly ParticipantsFilePathResolver $participantFilePathResolver,
        private readonly UserRepository $userRepository,
        private readonly ParticipantRepository $participantRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly Stopwatch $stopwatch,
        private readonly string $exportDirectory,
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

        $count = $this->selectionStepRepository->count([]);

        if (0 === $count) {
            $style->error('No selection step found');

            return 0;
        }

        $style->writeln(sprintf('Found %d selection steps', $count));

        $style->note('Starting the export.');

        $this->stopwatch->start('export_participants', 'Memory usage - Execution time');
        $filesystem = $this->cleanTmpExportsFiles();
        $selectionSteps = $this->selectionStepRepository->findAll();

        $tableSummary = (new Table($output))
            ->setHeaderTitle('Export Selection Step Participants')
            ->setStyle('box-double')
            ->setHeaders(['Step', 'Participant(s) exported'])
        ;

        $totalParticipants = 0;

        /** @var SelectionStep $selectionStep */
        foreach ($selectionSteps as $selectionStep) {
            $this->selectionParticipantExporter->initializeStyle($style);

            $filePaths = $this->getFilePaths($selectionStep);
            $usersExported = $this->exportUsersByBatch($input, $selectionStep);
            $participantsExported = $this->exportParticipantsByBatch($input, $selectionStep);

            $totalParticipants += $usersExported + $participantsExported;
            $tableSummary->addRows([[$selectionStep->getTitle(), $totalParticipants], new TableSeparator()]);

            $this->finalizeExportFiles($filesystem, $selectionStep, $filePaths, $style, $input, $output);
        }

        $tableSummary->setFooterTitle('Total Participants: ' . $totalParticipants);
        $tableSummary->render();

        $eventInfo = $this->stopwatch->stop('export_participants')->__toString();
        $style->success(sprintf(
            "Command '%s' ended successfully. %s",
            self::CAPCO_EXPORT_SELECTION_STEP_PARTICIPANTS,
            $eventInfo
        ));

        return 0;
    }

    public function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setName(self::CAPCO_EXPORT_SELECTION_STEP_PARTICIPANTS)
            ->setDescription('Export selection step participants')
        ;
    }

    /**
     * @return array<string, string>
     */
    private function getFilePaths(SelectionStep $step): array
    {
        return [
            ExportVariantsEnum::FULL->value => $this->participantFilePathResolver->getFullExportPath($step),
            ExportVariantsEnum::SIMPLIFIED->value => $this->participantFilePathResolver->getSimplifiedExportPath($step),
        ];
    }

    private function exportUsersByBatch(InputInterface $input, SelectionStep $step): int
    {
        $offset = 0;
        $countParticipants = 0;

        $this->append = false;

        do {
            $participants = $this->userRepository->findVotersForSelection($step, $offset, self::BATCH_SIZE);

            if (empty($participants)) {
                break;
            }

            $countParticipants += \count($participants);

            $this->selectionParticipantExporter->exportSelectionParticipants(
                selectionStep: $step,
                participants: $participants,
                delimiter: $input->getOption('delimiter'),
                withHeaders: !$this->append,
                append: $this->append,
            );

            $this->append = true;
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
        SelectionStep $step,
        array $filePaths,
        SymfonyStyle $style,
        InputInterface $input,
        OutputInterface $output
    ): void {
        $tmpFullExport = $filePaths[ExportVariantsEnum::FULL->value] . '.tmp';
        $tmpSimplifiedExport = $filePaths[ExportVariantsEnum::SIMPLIFIED->value] . '.tmp';

        if (file_exists($tmpFullExport)) {
            $filesystem->rename($tmpFullExport, $filePaths[ExportVariantsEnum::FULL->value], true);
        }

        if (file_exists($tmpSimplifiedExport)) {
            $filesystem->rename($tmpSimplifiedExport, $filePaths[ExportVariantsEnum::SIMPLIFIED->value], true);
        }

        foreach ($filePaths as $type => $path) {
            $variant = ExportVariantsEnum::from($type);
            if (file_exists($path)) {
                $this->executeSnapshot(
                    $input,
                    $output,
                    $step->getType() . '/' . $this->participantFilePathResolver->getFileName($step, $variant)
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

    private function exportParticipantsByBatch(InputInterface $input, SelectionStep $step): int
    {
        $offset = 0;
        $countParticipants = 0;

        do {
            $participants = $this->participantRepository->findVotersForSelection($step, $offset, self::BATCH_SIZE);

            if (empty($participants)) {
                break;
            }

            $countParticipants += \count($participants);

            $this->selectionParticipantExporter->exportSelectionParticipants(
                selectionStep: $step,
                participants: $participants,
                delimiter: $input->getOption('delimiter'),
                withHeaders: !$this->append,
                append: $this->append,
            );

            $this->entityManager->clear();
            $offset += self::BATCH_SIZE;
        } while (self::BATCH_SIZE === \count($participants));

        return $countParticipants;
    }
}
