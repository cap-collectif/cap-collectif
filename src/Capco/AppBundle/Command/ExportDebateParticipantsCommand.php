<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\DebateParticipantExporter;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Repository\DebateRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class ExportDebateParticipantsCommand extends BaseExportCommand
{
    private Manager $toggleManager;
    private DebateRepository $debateRepository;
    private DebateParticipantExporter $exporter;

    public function __construct(
        ExportUtils $exportUtils,
        Manager $manager,
        DebateRepository $debateRepository,
        DebateParticipantExporter $exporter
    ) {
        parent::__construct($exportUtils);
        $this->toggleManager = $manager;
        $this->debateRepository = $debateRepository;
        $this->exporter = $exporter;
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

        /** @var Questionnaire $debate */
        foreach ($debates as $debate) {
            $this->exporter->initializeStyle($style);
            $this->exporter->exportDebateParticipants($debate, $input->getOption('delimiter'));
            $style->progressAdvance();
        }

        $style->progressFinish();

        return 0;
    }

    public function configure(): void
    {
        parent::configure();
        $this
            ->setName('capco:export:debate:participants')
            ->setDescription('Export debate participants')
        ;
    }
}
