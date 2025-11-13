<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Command\Service\QuestionnaireContributionExporter;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\Repository\QuestionnaireStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Stopwatch\Stopwatch;
use Symfony\Contracts\Translation\TranslatorInterface;

class ExportQuestionnaireContributionsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    public const CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS = 'capco:export:questionnaire:contributions';
    public const STOP_WATCH_MARKER = 'export_questionnaire_contributions';
    private const STEP_FOLDER = 'questionnaire/';
    protected string $projectRootDir;

    public function __construct(
        ExportUtils $exportUtils,
        private readonly QuestionnaireStepRepository $questionnaireStepRepository,
        private readonly ContributionsFilePathResolver $contributionsFilePathResolver,
        private readonly QuestionnaireContributionExporter $questionnaireContributionExporter,
        private readonly Stopwatch $stopwatch,
        private readonly Manager $toggleManager,
        protected TranslatorInterface $translator,
        string $projectRootDir,
    ) {
        $this->projectRootDir = $projectRootDir;

        parent::__construct($exportUtils);
    }

    /** TODO Remove this method after all export questionnaire has been merged */
    public static function getFileName(
        Questionnaire $questionnaire,
        bool $projectAdmin,
        ?ExportVariantsEnum $variant = ExportVariantsEnum::FULL
    ): string {
        $extension = '.csv';
        $step = $questionnaire->getStep();
        $fileName = '';

        if ($step) {
            $fileName .= ($project = $step->getProject()) ? $project->getSlug() . '_' : '';
            $fileName .= $step->getSlug();
        } else {
            $fileName = $questionnaire->getSlug();
        }

        return self::getShortenedFilename($fileName, $extension, $projectAdmin, $variant);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setName(self::CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS)
            ->setDescription(
                'Export Contributions from Questionnaire. Exports contain only contributions from users with validated accounts and published responses.'
            )
        ;
        $this->addOption(name: 'stepId', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Only generate this step.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $style = new SymfonyStyle($input, $output);

        if (!$input->getOption('force') && !$this->toggleManager->isActive('export')) {
            $style->error('Please enable "export" feature to run this command');

            return 1;
        }

        $this->stopwatch->start(self::STOP_WATCH_MARKER, 'Memory usage - Execution time');

        $questionnaireStepCount = $this->questionnaireStepRepository->count([]);

        $style->writeln(sprintf('Found %d questionnaire steps', $questionnaireStepCount));

        if (0 === $questionnaireStepCount) {
            $style->error('No questionnaire steps to export found');

            return 0;
        }

        if ($input->getOption('stepId')) {
            $questionnaireSteps = [$this->questionnaireStepRepository->find($input->getOption('stepId'))];
        } else {
            $questionnaireSteps = $this->questionnaireStepRepository->findAllNotEmpty();
        }

        $style->note('Starting the export.');

        foreach ($questionnaireSteps as $questionnaireStep) {
            $questionnaire = $questionnaireStep->getQuestionnaire();
            if (null === $questionnaire) {
                continue;
            }

            $this->questionnaireContributionExporter->initializeStyle($style);

            $paths[ExportVariantsEnum::SIMPLIFIED->value] = $this->contributionsFilePathResolver->getSimplifiedExportPath($questionnaireStep);
            $paths[ExportVariantsEnum::FULL->value] = $this->contributionsFilePathResolver->getFullExportPath($questionnaireStep);
            $paths[ExportVariantsEnum::GROUPED->value] = $this->contributionsFilePathResolver->getGroupedExportPath($questionnaireStep);

            $this->questionnaireContributionExporter->exportQuestionnaireContributions(
                $questionnaireStep,
                $input->getOption('delimiter'),
                $paths
            );

            $style->writeln("\n<info>Exported the CSV files full : {$paths[ExportVariantsEnum::FULL->value]}</info>");
            $style->writeln("\n<info>Exported the CSV files simplified : {$paths[ExportVariantsEnum::SIMPLIFIED->value]}</info>\n");
            $style->writeln("\n<info>Exported the CSV files grouped : {$paths[ExportVariantsEnum::GROUPED->value]}</info>\n");

            $this->executeSnapshot($input, $output, self::STEP_FOLDER . $this->contributionsFilePathResolver->getFileName($questionnaireStep, ExportVariantsEnum::FULL));
            $this->executeSnapshot($input, $output, self::STEP_FOLDER . $this->contributionsFilePathResolver->getFileName($questionnaireStep, ExportVariantsEnum::SIMPLIFIED));
            $this->executeSnapshot($input, $output, self::STEP_FOLDER . $this->contributionsFilePathResolver->getFileName($questionnaireStep, ExportVariantsEnum::GROUPED));
        }

        $this->stopwatch->stop(self::STOP_WATCH_MARKER);
        $monitorMemoryAndTime = $this->stopwatch
            ->getEvent(self::STOP_WATCH_MARKER)
            ->__toString()
        ;

        $style->success(sprintf(
            "Command '%s' ended successfully. %s",
            self::CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS,
            $monitorMemoryAndTime
        ));

        return 0;
    }
}
