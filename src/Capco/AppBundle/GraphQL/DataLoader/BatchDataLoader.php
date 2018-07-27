<?php
namespace Capco\AppBundle\GraphQL\DataLoader;

use GraphQL\Executor\Promise\Promise;
use Overblog\DataLoader\DataLoader;
use Overblog\DataLoader\Option;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Cache\CacheItemPoolInterface;
use Psr\Log\LoggerInterface;

abstract class BatchDataLoader extends DataLoader
{
    protected $cache;
    protected $cacheKey;
    protected $logger;

    public function __construct(
        callable $batchFunction,
        PromiseAdapterInterface $promiseFactory,
        LoggerInterface $logger,
        CacheItemPoolInterface $cache
    ) {
        $options = new Option([
            'cacheKeyFn' =>
                function ($key) {
                    return '-[' . base64_encode(var_export($this->serializeKey($key), true)) . ']-';
                },
        ]);
        $this->cache = $cache;
        $this->logger = $logger;
        parent::__construct(
            function ($ids) use ($batchFunction) {
                return $batchFunction($ids);
            },
            $promiseFactory,
            $options
        );
    }

    /**
     * The serializeKey function is used to serialize into the cache the array of parameters.
     *
     * @param mixed $key An array of parameters (e.g ["proposal" => $proposal, "step" => $step, "includeExpired" => false]) or a keyName
     * @return array
     */
    abstract protected function serializeKey($key): array;

    /**
     * The load function overrides the base load function from DataLoader and extends it to support caching.
     * Given an array of parameters, it should return a promise that when resolved, return the value from
     * the batch function. If promise is already in cache, create an already fulfilled promise with value
     * from cache to immediatly get it.
     *
     * @param mixed $key An array of parameters (e.g ["proposal" => $proposal, "step" => $step, "includeExpired" => false]) or a keyName
     * @return mixed
     *
     * @see DataLoader
     * @throws \Psr\Cache\InvalidArgumentException
     */
    public function load($key)
    {
        $cacheKey = $this->getCacheKeyFromKey($key);
        $cacheItem = $this->cache->getItem($cacheKey);
        $this->logger->info(__METHOD__);
        if (!$cacheItem->isHit()) {
            $promise = parent::load($key);
            if ($promise instanceof Promise) {
                $promise->then(function ($value) use ($key, $cacheItem) {
                    $this->prime($key, $value);
                    $cacheItem->set($value);
                    $this->cache->save($cacheItem);
                    $this->logger->info("Saved key into cache");
                });
            }
            return $promise;
        }
        $this->logger->info("Get key from cache");

        return $this->getPromiseAdapter()->createFulfilled($cacheItem->get());
    }
}
