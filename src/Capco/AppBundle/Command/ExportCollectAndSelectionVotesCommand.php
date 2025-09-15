<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\FilePathResolver\VotesFilePathResolver;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ExportHeaders;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Capco\AppBundle\Service\CsvDataFormatter;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Helper\TableSeparator;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Stopwatch\Stopwatch;
use Symfony\Contracts\Translation\TranslatorInterface;

class ExportCollectAndSelectionVotesCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    private const BATCH_SIZE = 500;

    private const HEADER_KEYS = [
        ExportHeaders::EXPORT_PROPOSAL_ID,
        ExportHeaders::EXPORT_PROPOSAL_REFERENCE,
        ExportHeaders::EXPORT_PROPOSAL_TITLE,
        ExportHeaders::EXPORT_PROPOSAL_LINK,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_ID,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_RANKING,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_PUBLISHED_AT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_ANONYMOUS,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_AUTHOR_ID,
    ];

    protected static $defaultName = 'capco:export:collect-selection:votes';

    private readonly string $projectRootDir;

    public function __construct(
        ExportUtils $exportUtils,
        private readonly Manager $toggleManager,
        string $projectRootDir,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly Stopwatch $stopwatch,
        private readonly VotesFilePathResolver $votesFilePathResolver,
        private readonly EntityManagerInterface $em,
        private readonly TranslatorInterface $translator,
        private readonly ProposalUrlResolver $proposalUrlResolver,
        private readonly SelectionStepRepository $selectionStepRepository,
        private readonly CollectStepRepository $collectStepRepository,
        private readonly CsvDataFormatter $csvDataFormatter,
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
                'Export Votes from Collect Step & Selection Step, contains only proposals from users validated accounts and published responses.'
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

        $this->stopwatch->start('export_votes', 'Memory usage - Execution time');

        $steps = $this->getSteps();
        $stepCount = \count($steps);

        $style->writeln(sprintf('Found %d step(s)', $stepCount));
        $style->note('Starting the export.');

        $tableSummary = (new Table($output))
            ->setHeaderTitle('Export collect/selection steps votes')
            ->setStyle('box-double')
            ->setHeaders(['Step', 'Proposal(s) votes exported'])
        ;

        $translatedHeaderKeys = array_map(fn ($header) => $this->translator->trans($header), self::HEADER_KEYS);

        $totalVotes = 0;

        foreach ($steps as $step) {
            $path = $this->votesFilePathResolver->getSimplifiedExportPath($step);

            $handle = fopen($path, 'w');
            if (!$handle) {
                return Command::FAILURE;
            }

            fputcsv($handle, $translatedHeaderKeys);

            $votes = $this->getVotes($step);
            $votesTotalCount = $this->getVotesCount($step);

            $votesCount = 0;

            $progressBar = $style->createProgressBar($votesTotalCount);
            $progressBar->setFormat(
                "\n%current%/%max% processed votes(s)  [%bar%] %percent%%" .
                "\n\nTotal Votes Processed: %total_processed%" .
                "\nMemory Used: %memory_used%\n"
            );
            $progressBar->setMessage('processed vote(s) ');
            $progressBar->setOverwrite(false);
            $style->newLine(2);

            /** * @var ProposalSelectionVote $vote */
            foreach ($votes as $vote) {
                $proposal = $vote->getProposal();
                fputcsv($handle, [
                    $proposal->getId(),
                    $proposal->getReference(),
                    $proposal->getTitle(),
                    $this->proposalUrlResolver->__invoke($proposal),
                    $vote->getId(),
                    $vote->getPosition(),
                    $this->csvDataFormatter->getNullableDatetime($vote->getPublishedAt()),
                    $this->csvDataFormatter->getReadableBoolean($vote->isPrivate()),
                    $vote->getContributor()->getId(),
                ]);

                if (($votesCount % self::BATCH_SIZE) === 0) {
                    $this->em->clear();
                }
                ++$votesCount;

                $memUse = round(memory_get_usage() / 1000000, 2) . 'MB';
                $style->writeln(sprintf('Total Votes Processed: %d (memory used: %s)', $votesCount, $memUse));

                $progressBar->setMessage($memUse, 'memory_used');
                $progressBar->setMessage((string) $votesCount, 'total_processed');
                $progressBar->advance();
                $style->newLine(2);
            }

            fclose($handle);

            $totalVotes += $votesCount;
            $tableSummary->addRows([[$step->getTitle(), $votesCount], new TableSeparator()]);
            $style->writeln("\n<info>Exported the CSV files simplified: {$path}</info>\n");

            if (file_exists($path)) {
                $this->executeSnapshot(
                    $input,
                    $output,
                    $step->getType() . '/' . $this->votesFilePathResolver->getFileName($step, ExportVariantsEnum::SIMPLIFIED)
                );
            }
        }

        $tableSummary->setFooterTitle('Total Proposals: ' . $totalVotes);
        $tableSummary->render();

        $eventInfo = $this->stopwatch->stop('export_votes')->__toString();
        $style->success(sprintf(
            "Command '%s' ended successfully. %s",
            self::$defaultName,
            $eventInfo
        ));

        return 0;
    }

    /**
     * @return iterable< ProposalSelectionVote|ProposalCollectVote >
     */
    private function getVotes(AbstractStep $step): iterable
    {
        return match (true) {
            $step instanceof CollectStep => $this->proposalCollectVoteRepository->findForVotesExport($step),
            $step instanceof SelectionStep => $this->proposalSelectionVoteRepository->findForVotesExport($step),
            default => throw new \RuntimeException('Unexpected step type')
        };
    }

    private function getVotesCount(AbstractStep $step): int
    {
        return match (true) {
            $step instanceof CollectStep => $this->proposalCollectVoteRepository->countForVotesExport($step),
            $step instanceof SelectionStep => $this->proposalSelectionVoteRepository->countForVotesExport($step),
            default => throw new \RuntimeException('Unexpected step type')
        };
    }

    /**
     * @return array< CollectStep|SelectionStep >
     */
    private function getSteps(): array
    {
        $selectionSteps = $this->selectionStepRepository->findWithVotes();
        $collectSteps = $this->collectStepRepository->findWithVotes();

        return array_merge($selectionSteps, $collectSteps);
    }
}
