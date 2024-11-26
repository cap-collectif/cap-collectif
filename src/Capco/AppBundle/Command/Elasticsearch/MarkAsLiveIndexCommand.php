<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Capco\AppBundle\Elasticsearch\Client;
use Capco\AppBundle\Elasticsearch\IndexBuilder;
use Capco\AppBundle\Elasticsearch\Indexer;
use Elastica\Cluster;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputDefinition;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class MarkAsLiveIndexCommand extends Command
{
    protected static $defaultName = 'capco:es:set-live-index';
    protected IndexBuilder $indexManager;
    protected Indexer $indexer;
    private readonly Client $client;
    private readonly Cluster $cluster;

    public function __construct(IndexBuilder $indexManager, Indexer $indexer, Client $client, Cluster $cluster)
    {
        $this->indexManager = $indexManager;
        $this->indexer = $indexer;
        $this->client = $client;
        $this->cluster = $cluster;
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->setDescription('Set the Elasticsearch Index LIVE.')
            ->setDefinition(
                new InputDefinition(
                    [
                        new InputArgument('index', InputArgument::REQUIRED, 'Index to mark as LIVE'),
                        new InputOption('isJustCreated', null, InputOption::VALUE_NONE),
                    ]
                )
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $indexNameToMarkAsLive = $input->getArgument('index');

        if (!\in_array($indexNameToMarkAsLive, $this->cluster->getIndexNames()) && !$input->getOption('isJustCreated')) {
            throw new \RuntimeException(
                sprintf('Index Name %s does not exist.', $indexNameToMarkAsLive)
            );
        }

        $indexToMarkAsLive = $this->client->getIndex($indexNameToMarkAsLive);
        $this->indexManager->markAsLive($indexToMarkAsLive);
        $output->writeln(["<info>Index {$indexToMarkAsLive->getName()} mark as LIVE!</info>"]);

        return 0;
    }
}
