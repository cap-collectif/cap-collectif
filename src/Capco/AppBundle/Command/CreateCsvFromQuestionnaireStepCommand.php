<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Repository\QuestionnaireStepRepository;
use Capco\AppBundle\Resolver\ProjectDownloadResolver;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromQuestionnaireStepCommand extends ContainerAwareCommand
{
    protected function configure()
    {
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
        $container = $this->getContainer();
        if (!$input->getOption('force') && !$container->get(Manager::class)->isActive('export')) {
            $output->writeln('Please enable "export" feature to run this command');

            return;
        }

        $resolver = $container->get(ProjectDownloadResolver::class);

        if (($questionnaireStep = $this->getQuestionnaireStep($input))) {
            $steps = [$questionnaireStep];
        } else {
            $steps = $container
                ->get('doctrine')
                ->getRepository('CapcoAppBundle:Steps\QuestionnaireStep')
                ->findAll();
        }

        foreach ($steps as $qs) {
            $writer = $resolver->getContent($qs);
            $filename = '';
            if ($qs->getProject()) {
                $filename .= $qs->getProject()->getSlug() . '_';
            }
            $filename .= $qs->getSlug() . '.xlsx';
            $path = $container->getParameter('kernel.root_dir');
            $writer->save($path . '/../web/export/' . $filename);
            $output->writeln('The export file "' . $filename . '" has been created.');
        }
    }

    private function getQuestionnaireStep(InputInterface $input): ?QuestionnaireStep
    {
        if (!$input->getArgument('questionnaireStepId')) {
            return null;
        }

        return $this->getContainer()
            ->get('doctrine')
            ->getRepository(QuestionnaireStepRepository::class)
            ->find($input->getArgument('questionnaireStepId'));
    }
}
