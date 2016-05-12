<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Console\Input\InputArgument;

class CreateCsvFromQuestionnaireStepCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:export:questionnaire')
            ->setDescription('Create csv file from questionnaire step data')
            ->addArgument(
                'format',
                InputArgument::OPTIONAL,
                'Please provide the format of the file you want to export.'
            )
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
        $format = $input->getArgument('format') ?: 'csv';

        foreach ($steps as $qs) {
            $writer = $resolver->getContent($qs, $format);
            $date = (new \DateTime())->format('Y-m-d');
            $filename = $date.'_'.$qs->getProject()->getSlug().'_'.$qs->getSlug().'.'.$format;
            $path = $this->getContainer()->getParameter('kernel.root_dir');
            $writer->save($path.'/../web/export/'.$filename);
            $output->writeln('The export file "'.$filename.'" has been created.');
        }
    }
}
