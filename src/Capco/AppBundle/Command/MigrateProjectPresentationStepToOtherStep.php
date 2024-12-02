<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Repository\ProjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class MigrateProjectPresentationStepToOtherStep extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ProjectRepository $projectRepository
    ) {
        parent::__construct();
    }

    public function migratePresentationStepToCustomStep(Project $project, OutputInterface $output)
    {
        $projectAbstractSteps = $project->getSteps();
        $stepsIdToConvert = [];

        foreach ($projectAbstractSteps as $projectAbstractStep) {
            $step = $projectAbstractStep->getStep();
            $position = $projectAbstractStep->getPosition();
            if ($step instanceof PresentationStep && $position > 1) {
                $stepsIdToConvert[] = $step->getId();
            }
        }

        $stepsCount = \count($stepsIdToConvert);
        $ids = sprintf("'%s'", implode("','", $stepsIdToConvert));
        $sql = "UPDATE step SET step_type = 'other' WHERE id IN ({$ids})";

        $connection = $this->em->getConnection();
        $statement = $connection->prepare($sql);
        $statement->executeStatement();
        $output->writeln("Project : {$project->getTitle()} - Migrating {$stepsCount} presentation steps to other step");
    }

    protected function configure()
    {
        $this->setName('capco:migrate-project-presentation-step-to-other-step')
            ->addOption('id', null, InputOption::VALUE_REQUIRED, 'migrate a single project given an id')
            ->setDescription('Migrate project presentation step to other step.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $id = $input->getOption('id');
        if ($id) {
            $project = $this->projectRepository->find($id);
            if ($project instanceof Project) {
                $this->migratePresentationStepToCustomStep($project, $output);
                $output->writeln('DONE');

                return 0;
            }
        }

        $projects = $this->projectRepository->findAll();
        foreach ($projects as $project) {
            $this->migratePresentationStepToCustomStep($project, $output);
        }
        $output->writeln('DONE');

        return 0;
    }
}
