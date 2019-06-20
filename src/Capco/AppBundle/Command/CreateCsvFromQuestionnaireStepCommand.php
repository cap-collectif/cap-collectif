<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Symfony\Component\Console\Input\InputInterface;
use Capco\AppBundle\Resolver\ProjectDownloadResolver;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Repository\QuestionnaireStepRepository;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireExportResultsUrlResolver;

class CreateCsvFromQuestionnaireStepCommand extends BaseExportCommand
{
    private $toggleManager;
    private $projectDownloadResolver;
    private $questionnaireStepRepository;
    private $pathResolver;

    public function __construct(
        ExportUtils $exportUtils,
        ProjectDownloadResolver $projectDownloadResolver,
        QuestionnaireStepRepository $questionnaireStepRepository,
        QuestionnaireExportResultsUrlResolver $pathResolver,
        Manager $manager
    ) {
        $this->toggleManager = $manager;
        $this->projectDownloadResolver = $projectDownloadResolver;
        $this->questionnaireStepRepository = $questionnaireStepRepository;
        $this->pathResolver = $pathResolver;
        parent::__construct($exportUtils);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->setName('capco:export:questionnaire')
            ->setDescription('Create csv file from questionnaire step data')
            ->addArgument(
                'questionnaireStepId',
                InputArgument::OPTIONAL,
                'The ID of the questionnaire step'
            )
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set this option to force export if feature toggle "export" is disabled'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$input->getOption('force') && !$this->toggleManager->isActive('export')) {
            $output->writeln('Please enable "export" feature to run this command');

            return;
        }

        if ($questionnaireStep = $this->getQuestionnaireStep($input)) {
            $steps = [$questionnaireStep];
        } else {
            $steps = $this->questionnaireStepRepository->findAll();
        }

        foreach ($steps as $qs) {
            if ($qs->getQuestionnaire()) {
                $writer = $this->projectDownloadResolver->getContent($qs, $this->exportUtils);
                $filePath = $this->pathResolver->getFilePath($qs->getQuestionnaire());
                $writer->save($filePath);
                $output->writeln('The export file "' . $filePath . '" has been created.');
            }
        }
    }

    private function getQuestionnaireStep(InputInterface $input): ?QuestionnaireStep
    {
        if (!$input->getArgument('questionnaireStepId')) {
            return null;
        }

        return $this->questionnaireStepRepository->find($input->getArgument('questionnaireStepId'));
    }
}
