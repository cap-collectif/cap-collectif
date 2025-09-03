<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\ConsultationContributionExporter;
use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Request\Executor;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Helper\TableSeparator;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Stopwatch\Stopwatch;

class ExportConsultationContributionsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    public const CAPCO_EXPORT_CONSULTATION_CONTRIBUTIONS = 'capco:export:consultation:contributions';
    private const OPINION_BATCH_SIZE = 50;
    private const CONSULTATION_STEP_BATCH_SIZE = 25;
    protected string $projectRootDir;
    protected Executor $executor;

    public function __construct(
        private readonly Manager $toggleManager,
        ExportUtils $exportUtils,
        string $projectRootDir,
        private readonly Stopwatch $stopwatch,
        private readonly ConsultationContributionExporter $consultationContributionsExporter,
        private readonly OpinionRepository $opinionRepository,
        private readonly ConsultationStepRepository $consultationStepRepository,
        private readonly ContributionsFilePathResolver $contributionsFilePathResolver,
        private readonly EntityManagerInterface $entityManager,
        private readonly string $exportDirectory
    ) {
        $this->projectRootDir = $projectRootDir;

        parent::__construct($exportUtils);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setName(self::CAPCO_EXPORT_CONSULTATION_CONTRIBUTIONS)
            ->setDescription(
                'Create csv file of contributions from consultation step data.'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $style = new SymfonyStyle($input, $output);

        if (!$input->getOption('force') && !$this->toggleManager->isActive('export')) {
            $style->error('Please enable "export" feature to run this command');

            return 1;
        }

        $this->stopwatch->start('export_consultation_contributions', 'Memory usage - Execution time');

        $stepCount = $this->consultationStepRepository->count([]);

        if (0 === $stepCount) {
            $style->error('No consultation step found');

            return 0;
        }

        $filesystem = $this->cleanTmpExportsFiles();

        $style->writeln(sprintf('Found %d consultation step', $stepCount));
        $style->note('Starting the export.');
        $totalOpinions = 0;

        $tableSummary = (new Table($output))
            ->setHeaderTitle('Export Consultation Step Contributions')
            ->setStyle('box-double')
            ->setHeaders(['Step', 'Opinion(s) contributions exported'])
        ;

        $offset = 0;
        do {
            $consultationSteps = $this->consultationStepRepository->findBy([], null, self::CONSULTATION_STEP_BATCH_SIZE, $offset);

            if (empty($consultationSteps)) {
                break;
            }

            foreach ($consultationSteps as $consultationStep) {
                $this->consultationContributionsExporter->initializeStyle($style);
                $filePaths = $this->getFilePaths($consultationStep);
                $opinionsExported = $this->exportConsultationStepOpinionsByBatch(
                    $input,
                    $consultationStep,
                    $filePaths
                );

                $totalOpinions += $opinionsExported;
                $tableSummary->addRows([[$consultationStep->getTitle(), $opinionsExported], new TableSeparator()]);

                $this->finalizeExportFiles($filesystem, $consultationStep, $filePaths, $style, $input, $output);
            }

            $this->entityManager->clear();
            $offset += self::CONSULTATION_STEP_BATCH_SIZE;
        } while (self::CONSULTATION_STEP_BATCH_SIZE === \count($consultationSteps));

        $tableSummary->setFooterTitle('Total Opinions: ' . $totalOpinions);
        $tableSummary->render();

        $this->stopwatch->stop('export_consultation_contributions');
        $monitoreMemoryAndTime = $this->stopwatch
            ->getEvent('export_consultation_contributions')
            ->__toString()
        ;

        $style->success(sprintf(
            "Command '%s' ended successfully. %s",
            self::CAPCO_EXPORT_CONSULTATION_CONTRIBUTIONS,
            $monitoreMemoryAndTime
        ));

        return 0;
    }

    /**
     * @return array<string, string>
     */
    private function getFilePaths(ConsultationStep $consultationStep): array
    {
        return [
            'full' => $this->contributionsFilePathResolver->getFullExportPath($consultationStep),
            'simplified' => $this->contributionsFilePathResolver->getSimplifiedExportPath($consultationStep),
        ];
    }

    /**
     * @param array<string, string> $filePaths
     */
    private function exportConsultationStepOpinionsByBatch(InputInterface $input, ConsultationStep $consultationStep, array $filePaths): int
    {
        $offset = 0;
        $countOpinions = 0;
        $append = false;

        do {
            $opinions = $this->opinionRepository->getOpinionsByConsultationStepWithUserConfirmed(
                $consultationStep,
                $offset,
                self::OPINION_BATCH_SIZE
            );

            if (empty($opinions)) {
                break;
            }

            $countOpinions += \count($opinions);

            if (file_exists($filePaths['full']) && file_exists($filePaths['simplified'])) {
                $append = false;
            }

            $this->consultationContributionsExporter->exportConsultationContributions(
                $opinions,
                $input->getOption('delimiter'),
                $consultationStep,
                $append,
            );

            $append = true;
            $this->entityManager->clear();
            $offset += self::OPINION_BATCH_SIZE;
        } while (self::OPINION_BATCH_SIZE === \count($opinions));

        return $countOpinions;
    }

    /**
     * @param array<string, string> $filePaths
     */
    private function finalizeExportFiles(
        Filesystem $filesystem,
        ConsultationStep $consultationStep,
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
            $variant = ExportVariantsEnum::from($type);

            if (file_exists($path)) {
                $style->writeln("\n<info>Exported the CSV files {$type}: {$path}</info>\n");
                $this->executeSnapshot(
                    $input,
                    $output,
                    $consultationStep->getType() . '/' . $this->contributionsFilePathResolver->getFileName($consultationStep, $variant)
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
