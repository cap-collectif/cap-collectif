<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\OpinionModal;
use Capco\AppBundle\Helper\ConvertCsvToArray;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use InvalidArgumentException;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ImportConsultationModalsCommand extends Command
{
    public function __construct(
        private readonly ContainerInterface $container
    ) {
        parent::__construct();
    }

    protected function configure()
    {
        $this->setName('capco:import:consultation-modals-from-csv')
            ->setDescription('Import consultation modals from CSV file for consultation step')
            ->addArgument(
                'filePath',
                InputArgument::REQUIRED,
                'Please provide the path of the file you want to use.'
            )
            ->addArgument(
                'step',
                InputArgument::REQUIRED,
                'Please provide the slug of the consultation step you want to use'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->import($input, $output);

        return 0;
    }

    protected function import(InputInterface $input, OutputInterface $output)
    {
        $em = $this->getContainer()
            ->get('doctrine')
            ->getManager()
        ;
        $step = $this->getContainer()
            ->get(ConsultationStepRepository::class)
            ->findOneBySlug($input->getArgument('step'))
        ;
        if (!\is_object($step)) {
            throw new InvalidArgumentException('Unknown step with slug ' . $input->getArgument('step'), 1);
        }

        $modals = $this->getModals($input->getArgument('filePath'));
        foreach ($modals as $row) {
            $opinion = $this->getContainer()
                ->get(OpinionRepository::class)
                ->findOneBy([
                    'title' => $row['opinion'],
                    'step' => $step,
                ])
            ;

            if (!\is_object($opinion)) {
                throw new InvalidArgumentException('Unknown title: ' . $row['opinion'], 1);
            }

            $modal = new OpinionModal();
            $modal->setOpinion($opinion);
            $modal->setTitle($row['title']);
            $modal->setKey($row['key']);
            $modal->setBefore($row['before']);
            $modal->setAfter($row['after']);

            $em->persist($modal);
            $em->flush();
        }
    }

    protected function getModals(string $filePath)
    {
        return $this->getContainer()
            ->get(ConvertCsvToArray::class)
            ->convert($filePath)
        ;
    }

    private function getContainer()
    {
        return $this->container;
    }
}
