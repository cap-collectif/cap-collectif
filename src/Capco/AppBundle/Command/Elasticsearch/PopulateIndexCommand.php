<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Elasticsearch\Indexer;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class PopulateIndexCommand extends Command
{
    protected $toggleManager;
    protected $indexer;

    public function __construct(Manager $toggleManager, Indexer $indexer)
    {
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

        $type = $input->getArgument('type');
        $offset = $input->getArgument('offset');

        try {
            if ($type) {
                $this->indexer->indexAllForType($type, $offset, $output);
            } else {
                $this->indexer->indexAll($output);
            }
            $this->indexer->finishBulk();
        } catch (\RuntimeException $e) {
            $output->writeln('<error>' . $e->getMessage() . '</error>');

            return 1;
        }

        $output->writeln(['', '', 'All the documents are LIVE!']);

        return 0;
    }
}
