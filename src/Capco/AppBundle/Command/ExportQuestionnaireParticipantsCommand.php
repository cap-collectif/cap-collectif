<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\FilePathResolver\ParticipantsFilePathResolver;
use Capco\AppBundle\Command\Service\QuestionnaireParticipantExporter;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class ExportQuestionnaireParticipantsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    private const STEP_FOLDER = 'questionnaire/';
    private string $projectRootDir;

    public function __construct(
        ExportUtils $exportUtils,
        private Manager $toggleManager,
        private QuestionnaireRepository $questionnaireRepository,
        private QuestionnaireParticipantExporter $exporter,
        private ParticipantsFilePathResolver $participantsFilePathResolver,
        string $projectRootDir
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
            $questionnaireStep = $questionnaire->getStep();

            if (null === $questionnaireStep) {
                continue;
            }

            $this->exporter->initializeStyle($style);
            $this->exporter->exportQuestionnaireParticipants($questionnaire, $input->getOption('delimiter'));
            $this->executeSnapshot($input, $output, self::STEP_FOLDER . $this->participantsFilePathResolver->getFileName($questionnaireStep));
            $this->executeSnapshot($input, $output, self::STEP_FOLDER . $this->participantsFilePathResolver->getFileName($questionnaireStep, true));
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
            ->setName('capco:export:questionnaire:participants')
            ->setDescription('Export questionnaire participants')
        ;
    }
}
