<?php
namespace Capco\AppBundle\GraphQL\DataLoader;

use Http\Promise\Promise;
use Overblog\DataLoader\DataLoader;
use Overblog\DataLoader\Option;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Cache\CacheItemPoolInterface;

class BatchDataLoader extends DataLoader
{
    protected $cache;

    public function __construct(
        callable $batchFunction,
        PromiseAdapterInterface $promiseFactory,
        CacheItemPoolInterface $cache
    ) {
        $options = new Option([
            'batch' => true,
            'cacheKeyFn' =>
                function ($key) {
                    return '-[' . base64_encode(var_export($key, true)) . ']-';
                },
        ]);
        $this->cache = $cache;
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
