<?php
namespace Capco\AppBundle\GraphQL\DataLoader;

use Http\Promise\Promise;
use Overblog\DataLoader\DataLoader;
use Overblog\DataLoader\Option;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Cache\CacheItemPoolInterface;

class RedisDataLoader extends DataLoader
{
    protected $cache;

    public function __construct(
        callable $batchLoadFn,
        PromiseAdapterInterface $promiseFactory,
        CacheItemPoolInterface $cache,
        Option $options = null
    ) {
        parent::__construct($batchLoadFn, $promiseFactory, $options);
        $this->cache = $cache;
    }

    public function load($key)
    {
        $cacheItem = $this->cache->getItem($this->getCacheKeyFromKey($key));

        if (!$cacheItem->isHit()) {
            $promise = parent::load($key);
            if ($promise instanceof Promise) {
                $promise->then(function ($value) use ($key, $cacheItem) {
                    $this->prime($key, $value);
                    $cacheItem->set($value);
                    $this->cache->save($cacheItem);
                });
            }

            return $promise;
        }

        return $this->getPromiseAdapter()->createFulfilled($cacheItem->get());
    }
}
