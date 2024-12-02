<?php

namespace Capco\AppBundle\Elasticsearch;

use Elastica\Client;
use Elastica\Cluster;
use Elastica\Index;
use Elastica\Reindex;
use Elastica\Request;
use Elastica\Response;
use Elastica\Task;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Yaml\Yaml;

/**
 * Handle index creation and manipulation.
 */
class IndexBuilder
{
    final public const PREFIX_INDEX = 'capco_';

    public function __construct(protected Client $client, private readonly Cluster $cluster, protected string $indexName)
    {
    }

    /**
     * Return a new Index fully configured.
     */
    public function createIndex(): Index
    {
        $mapping = Yaml::parse(file_get_contents(__DIR__ . '/mapping.yaml'));

        $index = $this->client->getIndex($this->generateIndexName());

        if ($index->exists()) {
            throw new \RuntimeException(
                sprintf('Index %s is already created, something is wrong.', $index->getName())
            );
        }
        $index->create($mapping);

        return $index;
    }

    public function migrate(
        Index $currentIndex,
        array $params = [],
        ?OutputInterface $output = null
    ): Index {
        $newIndex = $this->createIndex();

        $reindex = new Reindex($currentIndex, $newIndex, $params);
        $reindex->setWaitForCompletion(Reindex::WAIT_FOR_COMPLETION_FALSE);

        $response = $reindex->run();

        if ($response->isOk()) {
            $taskId = $response->getData()['task'];

            $task = new Task($this->client, $taskId);
            $progressBar = new ProgressBar($output, 50);

            while (false === $task->isCompleted()) {
                $progressBar->advance(3);
                sleep(1); // Migrate of an index is not a production critical operation, sleep is ok.
                $task->refresh();
            }

            $progressBar->finish();

            return $newIndex;
        }

        throw new \RuntimeException(sprintf('Reindex call failed. %s', $response->getError()));
    }

    public function generateIndexName(): string
    {
        return sprintf('%s_%s', $this->indexName, date('Y-m-d-H-i-s'));
    }

    public function cleanOldIndices(int $numberOfIndicesKept = 1): array
    {
        $indexNames = $this->cluster->getIndexNames();
        $indexNames = array_filter(
            $indexNames,
            fn ($indexName) => str_starts_with($indexName, self::PREFIX_INDEX)
        );

        $indexNames = array_values($indexNames);

        rsort($indexNames);
        $indicesNamesKept = \array_slice($indexNames, 0, $numberOfIndicesKept);
        array_splice($indexNames, 0, $numberOfIndicesKept);

        if (0 === \count($indexNames)) {
            return [];
        }

        $indicesNamesDeleted = [];
        foreach ($indexNames as $indexName) {
            $this->client->getIndex($indexName)->delete();
            $indicesNamesDeleted[] = $indexName;
        }

        return [$indicesNamesDeleted, $indicesNamesKept];
    }

    public function getLiveSearchIndexName(): string
    {
        return $this->indexName;
    }

    public function getLiveSearchIndex(): Index
    {
        return $this->client->getIndex($this->getLiveSearchIndexName());
    }

    public function getLiveIndexingIndexName(): string
    {
        return $this->indexName . '_indexing';
    }

    public function getLastIndexRealName(): string
    {
        $indexNames = $this->client->getCluster()->getIndexNames();
        $indexes = [];
        foreach ($indexNames as $indexName) {
            if (!str_starts_with($indexName, self::PREFIX_INDEX)) {
                unset($indexNames[$indexName]);

                continue;
            }
            $date = \DateTime::createFromFormat(
                'Y-m-d-H-i-s',
                str_replace(self::PREFIX_INDEX, '', $indexName)
            );

            $indexes[] = [
                'date' => $date,
                'name' => $indexName,
            ];
        }
        // Newest first
        usort($indexes, static fn ($a, $b) => $a['date'] < $b['date']);

        return $indexes[0]['name'];
    }

    public function markAsLive(Index $index): Response
    {
        $data = ['actions' => []];

        $data['actions'][] = [
            'remove' => ['index' => '*', 'alias' => $this->getLiveIndexingIndexName()],
        ];
        $data['actions'][] = [
            'remove' => ['index' => '*', 'alias' => $this->getLiveSearchIndexName()],
        ];
        $data['actions'][] = [
            'add' => ['index' => $index->getName(), 'alias' => $this->getLiveIndexingIndexName()],
        ];
        $data['actions'][] = [
            'add' => ['index' => $index->getName(), 'alias' => $this->getLiveSearchIndexName()],
        ];

        return $this->client->request('_aliases', Request::POST, $data);
    }

    public function getClient(): Client
    {
        return $this->client;
    }

    /**
     * Make the refresh interval higher.
     */
    public function slowDownRefresh(Index $index)
    {
        $index->getSettings()->setRefreshInterval('60s');
    }

    /**
     * Make the refresh interval normal.
     */
    public function speedUpRefresh(Index $index)
    {
        $index->getSettings()->setRefreshInterval('1s');
    }
}
