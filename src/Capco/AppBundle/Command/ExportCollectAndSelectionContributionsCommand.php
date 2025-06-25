<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\CollectAndSelectionContributionExporter;
use Capco\AppBundle\Command\Service\ExportRegenerationService;
use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Helper\TableSeparator;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Stopwatch\Stopwatch;

class ExportCollectAndSelectionContributionsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    private const PROPOSAL_BATCH_SIZE = 50;

    protected static $defaultName = 'capco:export:collect-selection:contributions';

    private readonly string $projectRootDir;

    public function __construct(
        ExportUtils $exportUtils,
        private readonly ProposalRepository $proposalRepository,
        private readonly Manager $toggleManager,
        string $projectRootDir,
        private readonly CollectAndSelectionContributionExporter $collectAndSelectionContributionExporter,
        private readonly AbstractStepRepository $abstractStepRepository,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVote,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly ProposalFormRepository $proposalFormRepository,
        private readonly Stopwatch $stopwatch,
        private readonly ContributionsFilePathResolver $contributionsFilePathResolver,
        private readonly EntityManagerInterface $entityManager,
        private readonly string $exportDirectory,
        private readonly ExportRegenerationService $exportRegenerationService
    ) {
        parent::__construct($exportUtils);
        $this->projectRootDir = $projectRootDir;
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this
            ->setDescription(
                'Export Contributions from Collect Step & Selection Step, contains only proposals from users validated accounts and published responses.'
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

        $this->stopwatch->start('export_proposals', 'Memory usage - Execution time');

        $filesystem = $this->cleanTmpExportsFiles();
        $steps = $this->abstractStepRepository->getAllStepsByCollectStepOrSelectionStep();
        $stepCount = \count($steps);

        $style->writeln(sprintf('Found %d step(s)', $stepCount));
        $style->note('Starting the export.');

        $tableSummary = (new Table($output))
            ->setHeaderTitle('Export Step Proposals Contributions')
            ->setStyle('box-double')
            ->setHeaders(['Step', 'Proposal(s) contributions exported'])
        ;

        $totalProposals = 0;

        foreach ($steps as $step) {
            if ($this->skipStep($step)) {
                continue;
            }

            $this->collectAndSelectionContributionExporter->initializeStyle($style);

            $filePaths = $this->getFilePaths($step);
            $proposalsExported = $this->exportStepProposalsByBatch($input, $step, $filePaths);

            $totalProposals += $proposalsExported;
            $tableSummary->addRows([[$step->getTitle(), $proposalsExported], new TableSeparator()]);

            $this->finalizeExportFiles($filesystem, $step, $filePaths, $style, $input, $output);
        }

        $tableSummary->setFooterTitle('Total Proposals: ' . $totalProposals);
        $tableSummary->render();

        $eventInfo = $this->stopwatch->stop('export_proposals')->__toString();
        $style->success(sprintf(
            "Command '%s' ended successfully. %s",
            self::$defaultName,
            $eventInfo
        ));

        return 0;
    }

    private function skipStep(AbstractStep $step): bool
    {
        return CollectStep::class === $step::class && null === $step->getProposalForm();
    }

    /**
     * @return array<string, string>
     */
    private function getFilePaths(AbstractStep $step): array
    {
        return [
            'full' => $this->contributionsFilePathResolver->getFullExportPath($step),
            'simplified' => $this->contributionsFilePathResolver->getSimplifiedExportPath($step),
        ];
    }

    /**
     * @param array<string, string> $filePaths
     */
    private function exportStepProposalsByBatch(InputInterface $input, AbstractStep $step, array $filePaths): int
    {
        $offset = 0;
        $countProposals = 0;
        $append = false;
        $stepClass = $step::class;
        $proposalsIds = $this->proposalRepository->getProposalsByCollectStepOrSelectionStep($step->getId(), $stepClass);
        $votesCount = $step instanceof SelectionStep
            ? $this->proposalSelectionVote->findPublishedSelectionVoteIdsByStep($step)
            : $this->proposalCollectVoteRepository->countPublishedCollectVoteByStep($step, true, true);

        $questionsResponses = $this->proposalFormRepository->getQuestionsResponsesByProposalsIds($proposalsIds);
        $this->collectAndSelectionContributionExporter->setQuestionsResponses($questionsResponses);
        $this->exportRegenerationService->regenerateCsvIfCachedRowsCountMismatch(
            [...$proposalsIds, ...$votesCount],
            $step,
            'collect-selection-contributions-count',
            $this->contributionsFilePathResolver
        );

        do {
            $proposals = $this->proposalRepository->getProposalsByCollectStepOrSelectionStep(
                $step->getId(),
                $stepClass,
                self::PROPOSAL_BATCH_SIZE,
                $offset
            );
            if (empty($proposals)) {
                break;
            }

            $countProposals += \count($proposals);

            if (file_exists($filePaths['full']) && file_exists($filePaths['simplified'])) {
                $append = false;
            }

            $this->collectAndSelectionContributionExporter->exportStepContributions(
                $step,
                $proposals,
                $input->getOption('delimiter'),
                $append,
                $filePaths
            );

            $append = true;
            $this->entityManager->clear();
            $offset += self::PROPOSAL_BATCH_SIZE;
        } while (self::PROPOSAL_BATCH_SIZE === \count($proposals));

        return $countProposals;
    }

    /**
     * @param array<string, string> $filePaths
     */
    private function finalizeExportFiles(
        Filesystem $filesystem,
        AbstractStep $step,
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
                $style->writeln("\n<info>Exported the CSV files {$type}: {$path}</info>\n");
                $this->executeSnapshot(
                    $input,
                    $output,
                    $step->getType() . '/' . $this->contributionsFilePathResolver->getFileName($step, $isSimplified)
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
