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
        LoggerInterface $logger = null
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
                $responseData['hits']['total']
            );
        } else {
            $this->logQuery($path, $method, $data, $query, $start);
        }

        return $response;
    }

    private function logQuery(
        string $path,
        string $method,
        array $data,
        array $query,
        $start,
        float $engineMS = 0,
        int $itemCount = 0
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
                $itemCount
            );
        }
    }
}
