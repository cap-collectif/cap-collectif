<?php

namespace Capco\AppBundle\Elasticsearch;

use Elastica\Client as BaseClient;
use Elastica\Request;
use Elastica\Response;
use Psr\Log\LoggerInterface;

class Client extends BaseClient
{
    public function __construct(
        array $config = [],
        ?callable $callback = null,
        ?LoggerInterface $logger = null,
        private readonly bool $debug = false
    ) {
        parent::__construct($config, $callback, $logger);
    }

    public function request(
        $path,
        $method = Request::GET,
        $data = [],
        array $query = [],
        $contentType = Request::DEFAULT_CONTENT_TYPE
    ): Response {
        // ES < 7 compatibility, always count real total
        if (str_contains($path, '_search') && \is_array($query)) {
            $query['track_total_hits'] = true;
        }

        if (!$this->debug) {
            return parent::request($path, $method, $data, $query);
        }

        $start = microtime(true);
        $response = parent::request($path, $method, $data, $query);
        $responseData = $response->getData();

        if (isset($responseData['took'], $responseData['hits'])) {
            $this->logQuery(
                $path,
                $method,
                $data,
                $query,
                $start,
                $response->getEngineTime(),
                $responseData['hits']['total']['value'],
                $responseData
            );
        } else {
            $this->logQuery($path, $method, $data, $query, $start);
        }

        return $response;
    }

    private function logQuery(
        string $path,
        string $method,
        $data,
        array $query,
        $start,
        float $engineMS = 0.0,
        int $itemCount = 0,
        ?array $response = null
    ): void {
        if ($this->_logger instanceof ElasticsearchLogger) {
            $time = microtime(true) - $start;
            $connection = $this->getLastRequest()->getConnection();

            $connection_array = [
                'host' => $connection->getHost(),
                'port' => $connection->getPort(),
                'transport' => $connection->getTransport(),
                'headers' => $connection->hasConfig('headers')
                    ? $connection->getConfig('headers')
                    : [],
            ];
            $this->_logger->logQuery(
                $path,
                $method,
                $data,
                $time,
                $connection_array,
                $query,
                $engineMS,
                $itemCount,
                $response
            );
        }
    }
}
