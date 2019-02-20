<?php

namespace Capco\AppBundle\DataCollector;

use Capco\AppBundle\Elasticsearch\ElasticsearchLogger;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\DataCollector\DataCollector;

class ElasticsearchCollector extends DataCollector
{
    private $logger;

    public function __construct(ElasticsearchLogger $logger)
    {
        $this->logger = $logger;
    }

    /**
     * Collects data for the given Request and Response.
     *
     * @param Request         $request
     * @param Response        $response
     * @param \Exception|null $exception
     */
    public function collect(
        Request $request,
        Response $response,
        \Exception $exception = null
    ): void {
        $this->data['queries_count'] = $this->logger->getQueriesCount();
        $this->data['queries'] = $this->logger->getQueries();
    }

    public function reset(): void
    {
        $this->data = [];
    }

    public function getQueries(): array
    {
        return $this->data['queries'];
    }

    public function getQueriesCount(): int
    {
        return $this->data['queries_count'];
    }

    public function getTime(): int
    {
        $time = 0;
        foreach ($this->data['queries'] as $query) {
            $time += $query['engineMS'];
        }

        return $time;
    }

    /**
     * Returns the name of the collector.
     *
     * @return string The collector name
     */
    public function getName(): string
    {
        return 'capco.elasticsearch';
    }
}
