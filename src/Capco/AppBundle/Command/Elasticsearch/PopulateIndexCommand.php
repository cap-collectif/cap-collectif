<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class PopulateIndexCommand extends Command
{
    protected $toggleManager;
    protected $indexer;

    public function __construct(
        Manager $toggleManager,
        Indexer $indexer,
        private readonly Stopwatch $stopwatch
    ) {
        $this->toggleManager = $toggleManager;
        $this->indexer = $indexer;
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName('capco:es:populate')->setDescription(
            'Populate the current Elasticsearch Indexes.'
        );
        $this->addArgument('type', InputArgument::OPTIONAL, 'Populate only a specific type ?');
        $this->addArgument(
            'offset',
            InputArgument::OPTIONAL,
            'Populate from a specific offset (default 0)',
            0
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        if (!$this->toggleManager->isActive('indexation')) {
            $output->writeln(
                '<error>Please enable "indexation" feature to run this command</error>'
            );

            return 1;
        }

        $output->writeln(['Start indexing Elasticsearch.']);
        $output->writeln(['Current index : ' . $this->indexer->getIndex()->getName()]);

        $type = $input->getArgument('type');
        $offset = $input->getArgument('offset');

        try {
            $this->stopwatch->start('populate');
            if ($type) {
                $this->indexer->indexAllForType($type, $offset, $output, true);
            } else {
                $this->indexer->indexAll($output, true);
            }
            $this->indexer->finishBulk(true);
            $event = $this->stopwatch->stop('populate');
            $output->writeln(
                'Populate Elasticsearch duration: <info>' . $event->getDuration() / 1000 . '</info>s'
            );
        } catch (\RuntimeException $e) {
            $output->writeln('<error>' . $e->getMessage() . '</error>');

            return 1;
        }

        $output->writeln(['All the documents are LIVE!']);

        return 0;
    }
}
