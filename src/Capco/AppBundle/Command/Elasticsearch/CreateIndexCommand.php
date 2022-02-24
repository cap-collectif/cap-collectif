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
        $newPipeline = $newIndex->getClient()->request('_ingest/pipeline/geoip', 'PUT', [
            'description' => 'Add geoip info',
            'processors' => [
                [
                    'geoip' => [
                        'field' => 'ipAddress',
                        'ignore_missing' => true,
                        'target_field' => 'geoip',
                        'properties' => [
                            'continent_name',
                            'country_name',
                            'region_name',
                            'city_name',
                            'region_iso_code',
                            'location',
                        ],
                    ],
                ],
            ],
        ]);
        if ($newPipeline->getError()) {
            $output->writeln(['An error occurred when creating pipeline.']);
        } else {
            $output->writeln(['Pipeline <info>geoip</info> has been added.']);
        }
        $this->indexManager->slowDownRefresh($newIndex);

        $output->writeln([sprintf('Index <info>%s</info> created.', $newIndex->getName())]);

        $this->indexManager->speedUpRefresh($newIndex);

        if (true === $input->getOption('populate')) {
            $output->writeln('<info>Populating new index...</info>');

            try {
                $this->indexer->setIndex($newIndex);
                $this->indexer->indexAll($output, true);
                $this->indexer->finishBulk(true);
            } catch (\RuntimeException $e) {
                $output->writeln('<error>' . $e->getMessage() . '</error>');

                return 1;
            }

            $output->writeln('<info>All the documents are LIVE!</info>');
        }

        $this->indexManager->markAsLive($newIndex);
        $output->writeln(['<info>New Index is now LIVE!</info>']);

        return 0;
    }
}
