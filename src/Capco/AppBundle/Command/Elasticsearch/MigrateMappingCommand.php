<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Capco\AppBundle\Elasticsearch\IndexBuilder;
use Capco\AppBundle\Elasticsearch\Indexer;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class MigrateMappingCommand extends Command
{
    private IndexBuilder $indexBuilder;
    private Indexer $indexer;
    private LoggerInterface $logger;

    public function __construct(
        IndexBuilder $indexBuilder,
        Indexer $indexer,
        LoggerInterface $logger
    ) {
        $this->indexBuilder = $indexBuilder;
        $this->indexer = $indexer;
        $this->logger = $logger;
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName('capco:es:migrate')->setDescription('Migrate Elasticsearch mapping.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Elasticsearch Mapping Migrator');
        $io->text('<info>Starting Elasticsearch mapping migration...</info>');

        try {
            $upToDateIndex = $this->indexBuilder->migrate($this->indexer->getIndex(), [], $output);
            $this->indexBuilder->markAsLive($upToDateIndex);
            $io->success('Migration has succeed. Bye !');

            return 1;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            $io->error('The mapping migration failed.');

            return 0;
        }
    }
}
