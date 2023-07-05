<?php

namespace Capco\AppBundle\Elasticsearch;

use Elastica\Client;
use Elastica\Index;
use Elastica\Reindex;
use Elastica\Request;
use Elastica\Response;
use Elastica\Task;
use Elasticsearch\Endpoints\Get;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Yaml\Yaml;

/**
 * Handle index creation and manipulation.
 */
class IndexBuilder
{
    /**
     * @var Client
     */
    protected $client;
    protected $indexName;

    public function __construct(Client $client, string $indexName)
    {
        $this->client = $client;
        $this->indexName = $indexName;
    }

    /**
     * Return a new Index fully configured.
     */
    public function createIndex(): Index
    {
        $mapping = Yaml::parse(file_get_contents(__DIR__ . '/mapping.yaml'));

        $index = $this->client->getIndex($this->generateIndexName());

        if ($index->exists()) {
            throw new \RuntimeException(sprintf('Index %s is already created, something is wrong.', $index->getName()));
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

    public function cleanOldIndices(int $afterLiveLimit = 2): array
    {
        $indexes = $this->client->requestEndpoint(new Get());
        $indexes = $indexes->getData();

        foreach ($indexes as $indexName => &$data) {
            if (0 !== strpos($indexName, 'capco_')) {
                unset($indexes[$indexName]);

                continue;
            }

            $date = \DateTime::createFromFormat(
                'Y-m-d-H-i-s',
                str_replace('capco_', '', $indexName)
            );

            $data['date'] = $date;
            $data['is_live'] = isset($data['aliases'][$this->getLiveSearchIndexName()]);
        }

        // Newest first
        usort($indexes, function ($a, $b) {
            return $a['date'] < $b['date'];
        });

        $afterLiveCounter = 0;
        $livePassed = false;
        $deleted = [];
        foreach ($indexes as $indexName => $indexData) {
            if ($livePassed) {
                ++$afterLiveCounter;
            }
            if ($indexData['is_live']) {
                $livePassed = true;
            }

            if ($livePassed && $afterLiveCounter > $afterLiveLimit) {
                // Remove!
                $this->client->getIndex($indexName)->delete();
                $deleted[] = $indexName;
            }
        }

        return $deleted;
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
            if (0 !== strpos($indexName, 'capco_')) {
                unset($indexNames[$indexName]);

                continue;
            }
            $date = \DateTime::createFromFormat(
                'Y-m-d-H-i-s',
                str_replace('capco_', '', $indexName)
            );

            $indexes[] = [
                'date' => $date,
                'name' => $indexName,
            ];
        }
        // Newest first
        usort($indexes, static function ($a, $b) {
            return $a['date'] < $b['date'];
        });

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
