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
        $resolver = $this->getContainer()->get('capco.project.download.resolver');

        $steps = $this->getContainer()
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:Steps\QuestionnaireStep')
            ->findAll()
        ;

        foreach ($steps as $qs) {
            $writer = $resolver->getContent($qs);
            $filename = '';
            if ($qs->getProject()) {
                $filename .= $qs->getProject()->getSlug().'_';
            }
            $filename .= $qs->getSlug().'.xls';
            $path = $this->getContainer()->getParameter('kernel.root_dir');
            $writer->save($path.'/../web/export/'.$filename);
            $output->writeln('The export file "'.$filename.'" has been created.');
        }
    }
}
