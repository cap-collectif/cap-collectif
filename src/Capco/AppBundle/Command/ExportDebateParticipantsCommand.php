<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\DebateParticipantExporter;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Repository\DebateRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class ExportDebateParticipantsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    public const STEP_FOLDER = 'debate/';

    public function __construct(
        ExportUtils $exportUtils,
        private readonly Manager $toggleManager,
        private readonly DebateRepository $debateRepository,
        private readonly DebateParticipantExporter $exporter,
        private readonly ParticipantsFilePathResolver $participantsFilePathResolver,
        private readonly string $projectRootDir
    ) {
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

        $debates = $this->debateRepository->findAll();
        $style->progressStart($count);

        foreach ($debates as $debate) {
            /** @var ?DebateStep $debateStep */
            $debateStep = $debate->getStep();
            if (null === $debateStep?->getDebate()) {
                continue;
            }

            $this->exporter->initializeStyle($style);
            $this->exporter->exportDebateParticipants($debateStep, $input->getOption('delimiter'));
            $this->executeSnapshot($input, $output, self::STEP_FOLDER . $this->participantsFilePathResolver->getFileName($debateStep));
            $this->executeSnapshot($input, $output, self::STEP_FOLDER . $this->participantsFilePathResolver->getFileName($debateStep, true));
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
            ->setName('capco:export:debate:participants')
            ->setDescription('Export debate participants')
        ;
    }
}
