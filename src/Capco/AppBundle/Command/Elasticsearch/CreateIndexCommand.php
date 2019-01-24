<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Capco\AppBundle\Elasticsearch\IndexBuilder;
use Capco\AppBundle\Elasticsearch\Indexer;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputDefinition;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CreateIndexCommand extends Command
{
    protected $indexManager;
    protected $indexer;

    public function __construct(IndexBuilder $indexManager, Indexer $indexer)
    {
        $this->indexManager = $indexManager;
        $this->indexer = $indexer;
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName('capco:es:create')
            ->setDescription('Create the Elasticsearch Indexes.')
            ->setDefinition(
                new InputDefinition([new InputOption('populate', 'p', InputOption::VALUE_NONE)])
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $newIndex = $this->indexManager->createIndex();
        $this->indexManager->slowDownRefresh($newIndex);

        $output->writeln([sprintf('<info>Index %s created.</info>', $newIndex->getName()), '']);

        $this->indexManager->speedUpRefresh($newIndex);

        if (true === $input->getOption('populate')) {
            $output->writeln('<info>Populating new index...</info>');

            try {
                $this->indexer->setIndex($newIndex);
                $this->indexer->indexAll($output);
                $this->indexer->finishBulk();
            } catch (\RuntimeException $e) {
                $output->writeln('<error>' . $e->getMessage() . '</error>');

                return 1;
            }

            $output->writeln('<info>All the documents are LIVE!</info>');
        }

        $this->indexManager->markAsLive($newIndex);
        $output->writeln(['', '', 'New Index is now LIVE!']);

        return 0;
    }
}
