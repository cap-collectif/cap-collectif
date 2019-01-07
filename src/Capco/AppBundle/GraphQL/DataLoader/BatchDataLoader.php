<?php

namespace Capco\AppBundle\GraphQL\DataLoader;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Cache\RedisTagCache;
use GraphQL\Executor\Promise\Promise;
use Overblog\DataLoader\DataLoader;
use Overblog\DataLoader\Option;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;

abstract class BatchDataLoader extends DataLoader
{
    protected $cache;
    protected $cacheKey;
    protected $logger;
    protected $cachePrefix;
    protected $cacheDriver;
    protected $cacheTtl;

    public function __construct(
        callable $batchFunction,
        PromiseAdapterInterface $promiseFactory,
        LoggerInterface $logger,
        RedisTagCache $cache,
        string $cachePrefix,
        int $cacheTtl = RedisCache::ONE_MINUTE
    ) {
        $this->cachePrefix = $cachePrefix;
        $this->cache = $cache;
        $this->logger = $logger;
        $this->cacheTtl = $cacheTtl;
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
                return $batchFunction($ids);
            },
            $promiseFactory,
            $options
        );
    }

    public function invalidateAll(): void
    {
        $this->cache->invalidateTags([$this->cachePrefix]);
    }

    /**
     * The load function overrides the base load function from DataLoader and extends it to support caching.
     * Given an array of parameters, it should return a promise that when resolved, return the value from
     * the batch function. If promise is already in cache, create an already fulfilled promise with value
     * from cache to immediatly get it.
     *
     * @param mixed $key An array of parameters (e.g ["proposal" => $proposal, "step" => $step, "includeUnpublished" => false]) or a keyName
     *
     * @return mixed
     *
     * @see DataLoader
     *
     * @throws \Psr\Cache\InvalidArgumentException
     */
    public function load($key)
    {
        $cacheKey = $this->getCacheKeyFromKey($key);
        $cacheItem = $this->cache->getItem($cacheKey);

        // if (!$cacheItem->isHit()) {
            $this->logger->info('Cache MISS for: ' . var_export($this->serializeKey($key), true));

            $promise = parent::load($key);
            if ($promise instanceof Promise) {
                $promise->then(function ($value) use ($key, $cacheItem) {
                    $this->prime($key, $value);

                    $cacheItem
                        ->set($value)
                        ->expiresAfter($this->cacheTtl)
                        ->tag($this->getCacheTag($key))
                        ->tag($this->cachePrefix);

                    $this->cache->save($cacheItem);
                    $this->logger->info('Saved key into cache');
                });
            }

            return $promise;
        // }
        $this->logger->info('Cache HIT for: ' . var_export($this->serializeKey($key), true));

        return $this->getPromiseAdapter()->createFulfilled($cacheItem->get());
    }

    protected function getDecodedKeyFromKey(string $key): string
    {
        $replace = str_replace(['-[', ']-', $this->cachePrefix], '', $key);

        return base64_decode($replace);
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
}
