<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\QuestionnaireParticipantExporter;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class ExportQuestionnaireParticipantsCommand extends BaseExportCommand
{
    private Manager $toggleManager;
    private QuestionnaireRepository $questionnaireRepository;
    private QuestionnaireParticipantExporter $exporter;

    public function __construct(
        ExportUtils $exportUtils,
        Manager $manager,
        QuestionnaireRepository $questionnaireRepository,
        QuestionnaireParticipantExporter $exporter
    ) {
        parent::__construct($exportUtils);
        $this->toggleManager = $manager;
        $this->questionnaireRepository = $questionnaireRepository;
        $this->exporter = $exporter;
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

        $count = $this->questionnaireRepository->count([]);

        if (0 === $count) {
            $style->error('No questionnaires found');

            return 0;
        }

        $style->writeln(sprintf('Found %d questionnaires', $count));

        $style->note('Starting the export.');

        $questionnaires = $this->questionnaireRepository->findAll();
        $style->progressStart($count);

        /** @var Questionnaire $questionnaire */
        foreach ($questionnaires as $questionnaire) {
            $this->exporter->initializeStyle($style);
            $this->exporter->exportQuestionnaireParticipants($questionnaire, $input->getOption('delimiter'));
            $style->progressAdvance();
        }

        $style->progressFinish();

        return 0;
    }

    public function configure(): void
    {
        parent::configure();
        $this
            ->setName('capco:export:questionnaire:participants')
            ->setDescription('Export questionnaire participants')
        ;
    }
}
