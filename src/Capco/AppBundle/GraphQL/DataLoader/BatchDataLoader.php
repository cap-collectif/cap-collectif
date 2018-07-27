<?php
namespace Capco\AppBundle\GraphQL\DataLoader;

use GraphQL\Executor\Promise\Promise;
use Overblog\DataLoader\DataLoader;
use Overblog\DataLoader\Option;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Cache\CacheItemPoolInterface;
use Psr\Log\LoggerInterface;

class BatchDataLoader extends DataLoader
{
    protected $cache;
    protected $cacheKey;
    protected $logger;

    public function __construct(
        callable $batchFunction,
        PromiseAdapterInterface $promiseFactory,
        LoggerInterface $logger,
        CacheItemPoolInterface $cache,
        Option $options = null
    ) {
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
