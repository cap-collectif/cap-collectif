<?php

namespace Capco\AppBundle\Elasticsearch;

use Elastica\Client;
use Elastica\Index;
use Elastica\Request;
use Elastica\Response;
use Elasticsearch\Endpoints\Indices\Aliases\Get;
use Symfony\Component\Yaml\Yaml;

/**
 * Handle index creation and manipulation.
 */
class IndexBuilder
{
    const ALIAS_LIVE_SEARCH = 'capco';
    const ALIAS_LIVE_INDEXING = 'capco_indexing';

    /**
     * @var Client
     */
    protected $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    /**
     * Return a new Index fully configured.
     */
    public function createIndex(): Index
    {
        $mapping = Yaml::parse(file_get_contents(__DIR__ . '/mapping.yml'));

        $index = $this->client->getIndex($this->generateIndexName());

        if ($index->exists()) {
            throw new \RuntimeException(
                sprintf('Index %s is already created, something is wrong.', $index->getName())
            );
        }

        $index->create($mapping);

        return $index;
    }

    public function generateIndexName(): string
    {
        return sprintf('capco_%s', date('Y-m-d-H:i:s'));
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
                'Y-m-d-H:i:s',
                str_replace('capco_', '', $indexName)
            );

            $data['date'] = $date;
            $data['is_live'] = isset($data['aliases'][$this->getLiveSearchIndexName()]);
        }

        // Newest first
        uasort($indexes, function ($a, $b) {
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
        return self::ALIAS_LIVE_SEARCH;
    }

    public function getLiveSearchIndex(): Index
    {
        return $this->client->getIndex($this->getLiveSearchIndexName());
    }

    public function getLiveIndexingIndexName(): string
    {
        return self::ALIAS_LIVE_INDEXING;
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
