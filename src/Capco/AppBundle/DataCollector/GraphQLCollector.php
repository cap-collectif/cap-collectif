<?php

namespace Capco\AppBundle\DataCollector;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\DataCollector\DataCollector;

class GraphQLCollector extends DataCollector
{
    private $cache = ['READS' => 0, 'HITS' => [], 'MISSES' => []];
    private $batchFns = [];

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
        $graphqlQuery =
            'graphql_multiple_endpoint' === $request->attributes->get('_route') ||
            'graphql_endpoint'
                ? json_decode($request->getContent(), true)
                : null;
        $this->data['graphql_query'] = $graphqlQuery;
        $this->data['cache'] = $this->cache;
    }

    /**
     * @param mixed  $key      The serialized value from the data loader
     * @param string $subtype
     * @param float  $duration
     * @param mixed  $value    The normalized or denormalized value that was get from cache or from resolver
     * @param string $cacheKey
     */
    public function addCacheHit(
        $key,
        string $subtype,
        float $duration,
        $value,
        string $cacheKey
    ): void {
        $this->addCacheEntry(true, $key, $subtype, $duration, $value, $cacheKey);
    }

    /**
     * @param mixed  $key      The serialized value from the data loader
     * @param string $subtype
     * @param float  $duration
     * @param mixed  $value    The normalized or denormalized value that was get from cache or from resolver
     */
    public function addCacheMiss($key, string $subtype, float $duration, $value): void
    {
        $this->addCacheEntry(false, $key, $subtype, $duration, $value);
    }

    public function addBatchFunction($arguments, callable $function): void
    {
        $this->batchFns[] = compact('arguments', 'function');
    }

    public function incrementCacheRead(): void
    {
        ++$this->cache['READS'];
    }

    public function getBatchFunctions(): array
    {
        return $this->batchFns;
    }

    public function hasBatchFunctions(): bool
    {
        return \count($this->batchFns) > 0;
    }

    public function getCacheHitsMisses(): array
    {
        return \array_merge($this->getCacheHits(), $this->getCacheMisses());
    }

    public function getCache(): array
    {
        return $this->data['cache'];
    }

    public function getCacheHits(): array
    {
        return $this->data['cache']['HITS'];
    }

    public function getCacheHitsCount(): int
    {
        return \count($this->data['cache']['HITS']);
    }

    public function getCacheHitsReadsPercentage(): float
    {
        return \round(($this->getCacheHitsCount() / $this->getCacheTotalReads()) * 100, 2);
    }

    public function getCacheMisses(): array
    {
        return $this->data['cache']['MISSES'];
    }

    public function getCacheMissesCount(): int
    {
        return \count($this->data['cache']['MISSES']);
    }

    public function getCacheTotalReads(): int
    {
        return $this->getCacheHitsCount() + $this->getCacheMissesCount();
    }

    public function getQuery()
    {
        return $this->data['query'];
    }

    public function getGraphQLQuery()
    {
        return $this->data['graphql_query'];
    }

    public function getMethod()
    {
        return $this->data['method'];
    }

    public function getAcceptableContentTypes()
    {
        return $this->data['acceptable_content_types'];
    }

    public function reset(): void
    {
        $this->data = [];
    }

    /**
     * Returns the name of the collector.
     *
     * @return string The collector name
     */
    public function getName(): string
    {
        return 'capco.graphql';
    }

    private function addCacheEntry(
        bool $isHit,
        $key,
        string $subtype,
        float $duration,
        $value,
        ?string $cacheKey = null,
        ?string $type = 'dataloader'
    ): void {
        $cached = $isHit;
        $this->cache[$isHit ? 'HITS' : 'MISSES'][] = compact(
            'cached',
            'type',
            'subtype',
            'duration',
            'key',
            'value',
            'cacheKey'
        );
    }
}
