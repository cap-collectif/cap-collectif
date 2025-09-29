<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Capco\AppBundle\Elasticsearch\IndexBuilder;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Yaml\Yaml;

class CreateAnalyticsTestIndexCommand extends Command
{
    public function __construct(
        string $name,
        private readonly IndexBuilder $indexManager
    ) {
        parent::__construct($name);
    }

    protected function configure(): void
    {
        $this->setName('capco:es:create-analytics-test-index')->setDescription(
            'Create the Elasticsearch analytics test index.'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln(['Creating analytics_test index...']);
        $mapping = Yaml::parse(file_get_contents(__DIR__ . '/config/mapping.yaml'));
        $index = $this->indexManager->getClient()->getIndex('analytics_test');
        if ($index->exists()) {
            throw new \RuntimeException(sprintf('Index %s is already created, something is wrong.', $index->getName()));
        }
        $index->create($mapping);
        $output->writeln(['Index created. Indexing documents...']);
        $logs = json_decode(
            file_get_contents(__DIR__ . '/config/logs.json'),
            true,
            512,
            \JSON_THROW_ON_ERROR
        );
        $progressBar = new ProgressBar($output, \count($logs));
        $params = [];
        $progressBar->start();
        foreach ($logs as $log) {
            $params[] = ['index' => ['_index' => 'analytics_test', '_id' => $log['rayID']]];
            $params[] = $log;
            $progressBar->advance();
        }

        $bulkRequest = $this->indexManager->getClient()->bulk($params);
        if ($bulkRequest->getError()) {
            $output->writeln(['An error occured when indexing documents.']);

            return 1;
        }
        $progressBar->finish();
        $output->writeln([\PHP_EOL . 'Documents are indexed.']);

        return 0;
    }
}
