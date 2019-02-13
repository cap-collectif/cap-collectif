<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Resolver\ProjectDownloadResolver;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromQuestionnaireStepCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('capco:export:questionnaire')->setDescription(
            'Create csv file from questionnaire step data'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        if (!$container->get(Manager::class)->isActive('export')) {
            $output->writeln('Please enable "export" feature to run this command');

            return;
        }
        $resolver = $container->get(ProjectDownloadResolver::class);

        $steps = $container
            ->get('doctrine')
            ->getRepository('CapcoAppBundle:Steps\QuestionnaireStep')
            ->findAll();
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
}
