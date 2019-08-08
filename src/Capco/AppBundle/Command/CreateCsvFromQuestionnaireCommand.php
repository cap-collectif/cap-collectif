<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Capco\AppBundle\Resolver\ProjectDownloadResolver;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireExportResultsUrlResolver;

class CreateCsvFromQuestionnaireCommand extends BaseExportCommand
{
    private $toggleManager;
    private $projectDownloadResolver;
    private $questionnaireRepository;
    private $pathResolver;

    public function __construct(
        ExportUtils $exportUtils,
        ProjectDownloadResolver $projectDownloadResolver,
        QuestionnaireRepository $questionnaireRepository,
        QuestionnaireExportResultsUrlResolver $pathResolver,
        Manager $manager
    ) {
        $this->toggleManager = $manager;
        $this->projectDownloadResolver = $projectDownloadResolver;
        $this->questionnaireRepository = $questionnaireRepository;
        $this->pathResolver = $pathResolver;
        parent::__construct($exportUtils);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->setName('capco:export:questionnaire')
            ->setDescription('Create csv file from questionnaire step data')
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

        $questionnaires = $this->questionnaireRepository->findAll();
        foreach ($questionnaires as $questionnaire) {
            $writer = $this->projectDownloadResolver->getContent(
                $questionnaire,
                $this->exportUtils
            );
            $filePath = $this->pathResolver->getFilePath($questionnaire);
            $writer->save($filePath);
            $output->writeln('The export file "' . $filePath . '" has been created.');
        }
    }
}
