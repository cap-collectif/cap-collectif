<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Capco\AppBundle\Elasticsearch\IndexBuilder;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateIndexCommand extends Command
{
    protected $indexManager;

    public function __construct(IndexBuilder $indexManager)
    {
        $this->indexManager = $indexManager;
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName('capco:es:create')->setDescription('Create the Elasticsearch Indexes.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $newIndex = $this->indexManager->createIndex();
        $this->indexManager->slowDownRefresh($newIndex);

        $output->writeln([sprintf('<info>Index %s created.</info>', $newIndex->getName()), '']);

        $this->indexManager->speedUpRefresh($newIndex);
        $this->indexManager->markAsLive($newIndex);

        $output->writeln(['', '', 'New Index is now LIVE!']);

        return 0;
    }
}
