<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromQuestionnaireStepCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:export:questionnaire')
            ->setDescription('Create csv file from questionnaire step data')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        if (!$container->get('capco.toggle.manager')->isActive('export')) {
            return;
        }
        $resolver = $container->get('capco.project.download.resolver');

        $steps = $container
            ->get('doctrine')
            ->getRepository('CapcoAppBundle:Steps\QuestionnaireStep')
            ->findAll()
        ;

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
