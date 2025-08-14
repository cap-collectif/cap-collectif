<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\ExportRegenerationService;
use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Command\Service\QuestionnaireContributionExporter;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Repository\QuestionnaireStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Symfony\Component\Console\Input\InputInterface;
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
        private readonly ExportRegenerationService $exportRegenerationService,
    ) {
        $this->projectRootDir = $projectRootDir;

        parent::__construct($exportUtils);
    }

    /** TODO Remove this method after all export questionnaire has been merged */
    public static function getFileName(
        Questionnaire $questionnaire,
        bool $projectAdmin,
        ?bool $isSimplifiedExport = false
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

        return self::getShortenedFilename($fileName, $extension, $projectAdmin, $isSimplifiedExport);
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

        $questionnaireSteps = $this->questionnaireStepRepository->findAllNotEmpty();

        $style->note('Starting the export.');

        foreach ($questionnaireSteps as $questionnaireStep) {
            $questionnaire = $questionnaireStep->getQuestionnaire();
            if (null === $questionnaire) {
                continue;
            }

            $this->questionnaireContributionExporter->initializeStyle($style);

            $paths['simplified'] = $this->contributionsFilePathResolver->getSimplifiedExportPath($questionnaireStep);
            $paths['full'] = $this->contributionsFilePathResolver->getFullExportPath($questionnaireStep);

            $replies = $questionnaire->getReplies();
            $this->exportRegenerationService->regenerateCsvIfCachedRowsCountMismatch(
                [$replies],
                $questionnaireStep,
                'questionnaire-contributions-count',
                $this->contributionsFilePathResolver
            );
            $this->questionnaireContributionExporter->exportQuestionnaireContributions(
                $questionnaireStep,
                $input->getOption('delimiter'),
                $paths
            );

            $style->writeln("\n<info>Exported the CSV files full : {$paths['full']}</info>");
            $style->writeln("\n<info>Exported the CSV files simplified : {$paths['simplified']}</info>\n");

            $this->executeSnapshot($input, $output, self::STEP_FOLDER . $this->contributionsFilePathResolver->getFileName($questionnaireStep));
            $this->executeSnapshot($input, $output, self::STEP_FOLDER . $this->contributionsFilePathResolver->getFileName($questionnaireStep, true));
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
