<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\DebateParticipantExporter;
use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\Repository\DebateRepository;
use Capco\AppBundle\Repository\DebateStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
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
        private readonly DebateStepRepository $debateStepRepository,
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

        $debates = null;
        if ($input->getOption('stepId')) {
            $debateStep = $this->debateStepRepository->find($input->getOption('stepId'));
            $debate = $debateStep ? $debateStep->getDebate() : null;
            $debates = $debate ? [$debate] : [];
        } elseif ($input->getOption('debateId')) {
            $debate = $this->debateRepository->find($input->getOption('debateId'));
            $debates = $debate ? [$debate] : [];
        }

        $count = $debates ? \count($debates) : $this->debateRepository->count([]);

        if (0 === $count) {
            $style->error('No debate found');

            return 0;
        }

        $style->writeln(sprintf('Found %d debates', $count));

        $style->note('Starting the export.');

        $debates ??= $this->debateRepository->findAll();
        $style->progressStart($count);

        foreach ($debates as $debate) {
            /** @var ?DebateStep $debateStep */
            $debateStep = $debate->getStep();
            if (null === $debateStep?->getDebate()) {
                continue;
            }

            $this->ensureExportDirectories([
                ExportVariantsEnum::FULL->value => $this->participantsFilePathResolver->getFullExportPath($debateStep),
                ExportVariantsEnum::SIMPLIFIED->value => $this->participantsFilePathResolver->getSimplifiedExportPath($debateStep),
            ]);
            $this->exporter->initializeStyle($style);
            $this->exporter->exportDebateParticipants($debateStep, $input->getOption('delimiter'));
            $this->executeSnapshot($input, $output, self::STEP_FOLDER . $this->participantsFilePathResolver->getFileName($debateStep, ExportVariantsEnum::FULL));
            $this->executeSnapshot($input, $output, self::STEP_FOLDER . $this->participantsFilePathResolver->getFileName($debateStep, ExportVariantsEnum::SIMPLIFIED));
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
        $this->addOption(name: 'stepId', mode: InputOption::VALUE_REQUIRED, description: 'Only export the given debate step.');
        $this->addOption(name: 'debateId', mode: InputOption::VALUE_REQUIRED, description: 'Only export the given debate.');
    }
}
