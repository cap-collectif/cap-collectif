<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\OfficialResponse;
use Capco\AppBundle\Repository\OfficialResponseRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class PublisherCommand extends Command
{
    private OfficialResponseRepository $officialResponseRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        OfficialResponseRepository $officialResponseRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->officialResponseRepository = $officialResponseRepository;
        $this->entityManager = $entityManager;

        parent::__construct();
    }

    protected function configure()
    {
        $this->setName('capco:publisher')
            ->addOption(
                'time',
                null,
                InputOption::VALUE_OPTIONAL,
                '/!\ Should be used for CI only /!\ .The relative time you want to publish.',
                'now'
            )
            ->setDescription('Publish all official responses planned with past date.');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        foreach ($this->getEntitiesToBePublished($input) as $item) {
            $this->publish($item, $output);
        }
        $this->entityManager->flush();

        return 0;
    }

    private function getEntitiesToBePublished(InputInterface $input): array
    {
        $dateTime = new \DateTime($input->getOption('time'));
        $items = [];

        $items = array_merge($items, $this->officialResponseRepository->findPlanned($dateTime));

        return $items;
    }

    private function publish($item, OutputInterface $output): void
    {
        if ($item instanceof OfficialResponse) {
            $item->publishNow();
            $this->log($output, $item->getId(), 'OfficialResponse');
        }
    }

    private function log(OutputInterface $output, string $title, string $type): void
    {
        $output->writeln("<info>Publishing $type \"$title\"</info>");
    }
}
