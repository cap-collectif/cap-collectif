<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Repository\QuestionnaireStepRepository;
use Capco\AppBundle\Resolver\ProjectDownloadResolver;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromQuestionnaireStepCommand extends BaseExportCommand
{
    private $toggleManager;
    private $projectDownloadResolver;
    private $questionnaireStepRepository;
    private $projectRootDir;

    public function __construct(
        ExportUtils $exportUtils,
        ProjectDownloadResolver $projectDownloadResolver,
        QuestionnaireStepRepository $questionnaireStepRepository,
        string $projectRootDir,
        Manager $manager
    ) {
        $this->toggleManager = $manager;
        $this->projectDownloadResolver = $projectDownloadResolver;
        $this->questionnaireStepRepository = $questionnaireStepRepository;
        $this->projectRootDir = $projectRootDir;
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

        if (($questionnaireStep = $this->getQuestionnaireStep($input))) {
            $steps = [$questionnaireStep];
        } else {
            $steps = $this->questionnaireStepRepository->findAll();
        }

        foreach ($steps as $qs) {
            $writer = $this->projectDownloadResolver->getContent($qs, $this->exportUtils);
            $filename = '';
            if ($qs->getProject()) {
                $filename .= $qs->getProject()->getSlug() . '_';
            }
            $filename .= $qs->getSlug() . '.xlsx';
            $writer->save($this->projectRootDir . '/web/export/' . $filename);
            $output->writeln('The export file "' . $filename . '" has been created.');
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
