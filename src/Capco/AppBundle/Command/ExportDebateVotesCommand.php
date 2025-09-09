<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\DebateVoteExporter;
use Capco\AppBundle\Command\Service\FilePathResolver\VotesFilePathResolver;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\Repository\DebateStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class ExportDebateVotesCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    private string $projectRootDir;

    public function __construct(
        ExportUtils $exportUtils,
        private Manager $toggleManager,
        private DebateStepRepository $debateStepRepository,
        private DebateVoteExporter $exporter,
        private VotesFilePathResolver $votesFilePathResolver,
        string $projectRootDir
    ) {
        parent::__construct($exportUtils);
        $this->projectRootDir = $projectRootDir;
    }

    public function execute(InputInterface $input, OutputInterface $output): int
    {
        $style = new SymfonyStyle($input, $output);

        if (!$input->getOption('force') && !$this->toggleManager->isActive('export')) {
            $style->error('Please enable "export" feature to run this command');

            return 1;
        }

        $count = $this->debateStepRepository->count([]);

        if (0 === $count) {
            $style->error('No debate found');

            return 0;
        }

        $style->writeln(sprintf('Found %d debates', $count));

        $style->note('Starting the export.');

        $debateSteps = $this->debateStepRepository->findAll();
        $style->progressStart($count);

        foreach ($debateSteps as $debateStep) {
            $debate = $debateStep->getDebate();
            if (null === $debate) {
                continue;
            }

            $this->exporter->initializeStyle($style);
            $this->exporter->exportDebateVotes($debate, $debateStep, $input->getOption('delimiter'));
            $this->executeSnapshot($input, $output, 'debate/' . $this->votesFilePathResolver->getFileName($debateStep, ExportVariantsEnum::FULL));
            $this->executeSnapshot($input, $output, 'debate/' . $this->votesFilePathResolver->getFileName($debateStep, ExportVariantsEnum::SIMPLIFIED));
            $style->progressAdvance();
        }

        $style->progressFinish();

        return 0;
    }

    public function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this
            ->setName('capco:export:debate:votes')
            ->setDescription('Export debate votes')
        ;
    }
}
