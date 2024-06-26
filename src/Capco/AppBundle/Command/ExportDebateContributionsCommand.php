<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\DebateContributionExporter;
use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Repository\DebateRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Stopwatch\Stopwatch;

class ExportDebateContributionsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    public const STEP_FOLDER = 'debate/';

    private const CAPCO_EXPORT_DEBATE_CONTRIBUTIONS = 'capco:export:debate:contributions';
    private Manager $toggleManager;
    private DebateRepository $debateRepository;
    private DebateContributionExporter $debateContributionExporter;
    private ContributionsFilePathResolver $contributionsFilePathResolver;
    private string $projectRootDir;
    private EntityManagerInterface $entityManager;
    private Stopwatch $stopwatch;

    public function __construct(
        ExportUtils $exportUtils,
        Manager $manager,
        DebateRepository $debateRepository,
        DebateContributionExporter $debateContributionExporter,
        ContributionsFilePathResolver $contributionsFilePathResolver,
        EntityManagerInterface $entityManager,
        Stopwatch $stopwatch,
        string $projectRootDir
    ) {
        $this->toggleManager = $manager;
        $this->debateRepository = $debateRepository;
        $this->debateContributionExporter = $debateContributionExporter;
        $this->contributionsFilePathResolver = $contributionsFilePathResolver;
        $this->projectRootDir = $projectRootDir;
        $this->entityManager = $entityManager;
        $this->stopwatch = $stopwatch;
        parent::__construct($exportUtils);
    }

    public function execute(InputInterface $input, OutputInterface $output): int
    {
        $style = new SymfonyStyle($input, $output);

        if (!$input->getOption('force') && !$this->toggleManager->isActive('export')) {
            $style->error('Please enable "export" feature to run this command');

            return 1;
        }

        $count = $this->debateRepository->count([]);

        if (0 === $count) {
            $style->error('No debate found');

            return 0;
        }

        $style->writeln(sprintf('Found %d debates', $count));

        $style->note('Starting the export.');

        $offset = 0;
        $batchSize = DebateContributionExporter::BATCH_SIZE;
        $this->stopwatch->start('export_proposals');
        do {
            $debates = $this->debateRepository->findDebateByAllArgumentsWithConfirmedUser($offset, $batchSize);
            foreach ($debates as $debate) {
                $this->debateContributionExporter->initializeStyle($style);
                $this->debateContributionExporter->exportDebateContributions(
                    $debate,
                    $output,
                    $input->getOption('delimiter')
                );

                $this->executeSnapshot(
                    $input,
                    $output,
                    self::STEP_FOLDER . $this->contributionsFilePathResolver->getFileName($debate->getStep(), true)
                );
                $this->executeSnapshot(
                    $input,
                    $output,
                    self::STEP_FOLDER . $this->contributionsFilePathResolver->getFileName($debate->getStep())
                );
            }
            $this->entityManager->clear();
            $offset += $batchSize;
        } while (\count($debates) > 0);

        $this->stopwatch->stop('export_proposals');
        $monitoreMemoryAndTime = $this->stopwatch
            ->getEvent('export_proposals')
            ->__toString()
        ;

        $style->success(sprintf(
            "Command '%s' ended successfully. %s",
            self::CAPCO_EXPORT_DEBATE_CONTRIBUTIONS,
            $monitoreMemoryAndTime
        ));

        return 0;
    }

    public function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this
            ->setName(self::CAPCO_EXPORT_DEBATE_CONTRIBUTIONS)
            ->setDescription('Export debate contributions')
        ;
    }
}
