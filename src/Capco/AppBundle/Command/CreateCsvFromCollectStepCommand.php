<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Resolver\ProjectDownloadResolver;
use Doctrine\Bundle\DoctrineBundle\Registry;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromCollectStepCommand extends ContainerAwareCommand
{
    /**
     * @var ProjectDownloadResolver
     */
    protected $downloadResolver;

    /**
     * @var Registry
     */
    protected $doctrine;

    protected function configure()
    {
        $this
            ->setName('capco:export:collect')
            ->setDescription('Create csv file from collect step data')
            ->addArgument('projectId', InputArgument::OPTIONAL, 'The ID of the project')
            ->addOption('withoutVote', 'w', InputOption::VALUE_NONE, 'Remove vote lines in export');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        if (!$container->get('capco.toggle.manager')->isActive('export')) {
            return;
        }
        $withoutVote = $input->getOption('withoutVote');
        $this->downloadResolver = $container->get('capco.project.download.resolver');
        $this->doctrine = $container->get('doctrine');

        if ($project = $this->getProject($input)) {
            $steps = $project->getSteps()
                ->filter(function (ProjectAbstractStep $projectAbstractStep) {
                    return $projectAbstractStep->getStep() instanceof CollectStep;
                })
                ->map(function (ProjectAbstractStep $projectAbstractStep) {
                    return $projectAbstractStep->getStep();
                });
        } else {
            $steps = $this->doctrine->getRepository('CapcoAppBundle:Steps\CollectStep')->findAll();
        }

        foreach ($steps as $step) {
            $this->createExport($step, !$withoutVote)
                ->save($container->getParameter('kernel.root_dir') . '/../web/export/' . $this->filename($step));
            $output->writeln('The export file "' . $this->filename($step) . '" has been created.');
        }
    }

    protected function createExport(CollectStep $collectStep, bool $withVote = true)
    {
        return $this->downloadResolver->getContent($collectStep, $withVote);
    }

    protected function filename(CollectStep $collectStep): string
    {
        return $collectStep->getProject()
            ? $collectStep->getProject()->getSlug() . '_' . $collectStep->getSlug() . '.xlsx'
            : $collectStep->getSlug() . '.xlsx';
    }

    protected function getProject(InputInterface $input)
    {
        if ($input->getArgument('projectId')) {
            return $this->doctrine->getRepository('CapcoAppBundle:Project')->find($input->getArgument('projectId'));
        }

        return null;
    }
}
