<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;

class CreateCsvFromCollectStepCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:export:collect')
            ->setDescription('Create csv file from collect step data')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $resolver = $this->getContainer()->get('capco.project.download.resolver');

        $steps = $this->getContainer()
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:CollectStep')
            ->findAll()
        ;

        $fs = new FileSystem();

        foreach ($steps as $cs) {
            $content = $resolver->getContent($cs, 'csv');
            $date = (new \DateTime())->format('Y-m-d');
            $filename = $date.'_'.$cs->getProject()->getSlug().'_'.$cs->getSlug().'.csv';
            $path = $this->getContainer()->getParameter('kernel.root_dir');
            $fs->dumpFile($path.'/../web/export/'.$filename, $content);
            $output->writeln('The export file "'.$filename.'" has been created.');
        }
    }
}
