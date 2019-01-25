<?php

namespace Capco\AppBundle\GraphQL\DataLoader;

use Capco\AppBundle\DataCollector\GraphQLCollector;
use Psr\Log\LoggerInterface;
use Overblog\DataLoader\Option;
use Overblog\DataLoader\DataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Symfony\Component\Cache\Adapter\AdapterInterface;
use Symfony\Component\Cache\Adapter\TagAwareAdapterInterface;

abstract class BatchDataLoader extends DataLoader
{
    protected $cache;
    protected $cacheKey;
    protected $logger;
    protected $cachePrefix;
    protected $cacheDriver;
    protected $cacheTtl;
    protected $debug;
    protected $enableCache = true;
    private $collector;

    public function __construct(
        callable $batchFunction,
        PromiseAdapterInterface $promiseFactory,
        LoggerInterface $logger,
        AdapterInterface $cache,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        bool $enableCache = true
    ) {
        $this->cachePrefix = $cachePrefix;
        $this->cache = $cache;
        $this->logger = $logger;
        $this->cacheTtl = $cacheTtl;
        $this->debug = $debug;
        $this->enableCache = $enableCache;
        $this->collector = $collector;
        $options = new Option([
            'cacheKeyFn' => function ($key) {
                $serializedKey = $this->serializeKey($key);

                return str_replace(
                    ':',
                    '',
                    $this->cachePrefix .
                        '-[' .
                        (\is_string($serializedKey)
                            ? $serializedKey
                            : base64_encode(var_export($this->serializeKey($key), true))) .
                        ']-'
                );
            },
        ]);
        parent::__construct(
            function ($ids) use ($batchFunction) {
                $this->collector->addBatchFunction($ids, $batchFunction);

                return $batchFunction($ids);
            },
            $promiseFactory,
            $options
        );
    }

    public function invalidateAll(): void
    {
        if ($this->cache instanceof TagAwareAdapterInterface) {
            $this->cache->invalidateTags([$this->cachePrefix]);
        }
    }

    /**
     * The load function overrides the base load function from DataLoader and extends it to support caching.
     * Given an array of parameters, it should return a promise that when resolved, return the value from
     * the batch function. If promise is already in cache, create an already fulfilled promise with value
     * from cache to immediatly get it.
     *
     * @param mixed $key An array of parameters (e.g ["proposal" => $proposal, "step" => $step, "includeUnpublished" => false]) or a keyName
     *
     * @return Promise
     *
     * @see DataLoader
     *
     * @throws \Psr\Cache\InvalidArgumentException
     */
    public function load($key)
    {
        $cacheItem = null;
        $result = null;

        if ($this->enableCache) {
            $cacheKey = $this->getCacheKeyFromKey($key);
            $this->collector->incrementCacheRead();
            $cacheItem = $this->cache->getItem($cacheKey);
        }

        if (!$this->enableCache || !$cacheItem->isHit()) {
            if ($this->debug) {
                $parts = explode('\\', static::class);
                $subtype = array_pop($parts);
                $this->collector->addCacheMiss($this->serializeKey($key), $subtype);
                $this->logger->info(
                    \get_class($this) .
                        ' Cache MISS for: ' .
                        var_export($this->serializeKey($key), true)
                );
            }

            $promise = parent::load($key);
            if ($promise instanceof Promise) {
                $promise->then(function ($value) use ($key, &$result, $cacheItem) {
                    $this->prime($key, $value);

                    if ($this->enableCache) {
                        $cacheItem
                            ->set($this->normalizeValue($value))
                            ->expiresAfter($this->cacheTtl);
                        if ($this->cache instanceof TagAwareAdapterInterface) {
                            $cacheItem->tag(
                                array_merge($this->getCacheTag($key), [$this->cachePrefix])
                            );
                        }

                        $this->cache->save($cacheItem);
                    } else {
                        $result = $value;
                    }

                    if ($this->debug) {
                        $this->logger->info('Saved key into cache with value : ');
                    }
                });
            }

            return $promise;
        }

        if ($this->debug) {
            $parts = explode('\\', static::class);
            $subtype = array_pop($parts);
            $this->collector->addCacheHit($this->serializeKey($key), $subtype);
            $this->logger->info(
                \get_class($this) . 'Cache HIT for: ' . var_export($this->serializeKey($key), true)
            );
        }

        if ($this->enableCache) {
            $value = $this->denormalizeValue($cacheItem->get());

            return $this->getPromiseAdapter()->createFulfilled($value);
        }

        return $this->getPromiseAdapter()->createFulfilled($result);
    }

    /**
     * The serializeKey function is used to serialize into the cache the array of parameters.
     *
     * @param mixed $key An array of parameters (e.g ["proposal" => $proposal, "step" => $step, "includeUnpublished" => false]) or a keyName
     *
     * @return array|string
     */
    abstract protected function serializeKey($key);

    /**
     * The getCacheTag function is used to set tags on cache item.
     *
     * @param mixed $key An array of parameters (e.g ["proposal" => $proposal, "step" => $step, "includeUnpublished" => false]) or a keyName
     *
     * @return array
     */
    protected function getCacheTag($key): array
    {
        return [];
    }

    protected function normalizeValue($value)
    {
        return $value;
    }

    protected function denormalizeValue($value)
    {
        return $value;
    }
}
