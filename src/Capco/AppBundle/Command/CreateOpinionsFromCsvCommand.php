<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Helper\ProgressBar;

class CreateOpinionsFromCsvCommand extends ContainerAwareCommand
{

    protected function configure()
    {
        $this
        ->setName('import:account-from-csv')
        ->setDescription('Import opinions from CSV file');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln('<comment>Start : ' . (new \DateTime())->format('d-m-Y G:i:s') . ' ---</comment>');

        $this->import($input, $output);

        $output->writeln('<comment>End : ' . (new \DateTime())->format('d-m-Y G:i:s') . ' ---</comment>');
    }

    protected function import(InputInterface $input, OutputInterface $output)
    {
        $data = $this->get($input, $output);

        $em = $this->getContainer()->get('doctrine')->getManager();

        $progress = new ProgressBar($output, count($data));
        $progress->start();

        foreach ($data as $row) {

            $opinion = $em->getRepository('CapcoAppBundle:Opinion')
                          ->findOneByTitle($row['title']);

            if (!is_object($opinion)){
                $opinion = new Opinion();
                $opinion->setTitle($row['title']);
            }

            $em->persist($opinion);
            $em->flush();
            $progress->advance(1);
        }

        $progress->finish();
    }

    protected function get(InputInterface $input, OutputInterface $output)
    {
        $fileName = 'pouet.csv';

        $converter = $this->getContainer()->get('import.csvtoarray');
        $data = $converter->convert($fileName, ';');

        return $data;
    }
}
