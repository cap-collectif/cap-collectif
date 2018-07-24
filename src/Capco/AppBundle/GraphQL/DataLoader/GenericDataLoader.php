<?php
namespace Capco\AppBundle\GraphQL\DataLoader;

use Overblog\DataLoader\CacheMap;
use Overblog\DataLoader\Option;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Cache\CacheItemPoolInterface;

class GenericDataLoader extends RedisDataLoader
{
    public function __construct(
        callable $mapFunction,
        PromiseAdapterInterface $promiseFactory,
        CacheMap $cacheMap,
        CacheItemPoolInterface $cache
    ) {
        $options = new Option([
            'batch' => true,
            'cacheMap' => $cacheMap,
            'cacheKeyFn' =>
                function ($key) {
                    return '-[' . base64_encode(var_export($key, true)) . ']-';
                },
        ]);
        parent::__construct(
            function ($ids) use ($mapFunction) {
                return $mapFunction($ids);
            },
            $promiseFactory,
            $cache,
            $options
        );
    }
}
