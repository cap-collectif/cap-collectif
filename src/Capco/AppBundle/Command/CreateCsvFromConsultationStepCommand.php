<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Filesystem\Filesystem;

class CreateCsvFromConsultationStepCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:create-csv-from-consultation')
            ->setDescription('Create csv file from consultation step data')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $resolver = $this->getContainer()->get('capco.project.download.resolver');

        $steps = $this->getContainer()
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:ConsultationStep')
            ->findAll()
        ;

        $fs = new FileSystem();

        foreach ($steps as $cs) {
            $content = $resolver->getContent($cs, 'csv');
            $filename = $cs->getProject()->getSlug().'_'.$cs->getSlug().'.csv';
            $path = $this->getContainer()->getParameter('kernel.root_dir');
            $fs->dumpFile($path.'/../web/media/'.$filename, $content);
            $output->writeln('Export '.$filename.' have been created.');
        }
    }
}
