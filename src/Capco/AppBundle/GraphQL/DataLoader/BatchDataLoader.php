<?php
namespace Capco\AppBundle\GraphQL\DataLoader;

use Capco\AppBundle\Manager\RedisCacheManager;
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
        RedisCacheManager $cache,
        string $cachePrefix,
        int $cacheTtl = 60
    ) {
        $this->cachePrefix = $cachePrefix;
        $this->cache = $cache;
        $this->logger = $logger;
        $this->cacheTtl = $cacheTtl;
        $options = new Option([
            'cacheKeyFn' =>
                function ($key) {
                    $serializedKey = $this->serializeKey($key);
                    return str_replace(
                        ':',
                        '',
                        $this->cachePrefix .
                            '-[' .
                            (
                                \is_string($serializedKey)
                                    ? $serializedKey
                                    : base64_encode(var_export($this->serializeKey($key), true))
                            ) .
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
        $this->cache->deleteItems($this->getCacheKeys());
    }

    protected function getCacheKeys(): array
    {
        return $this->cache->getKeysByPattern('*' . $this->cachePrefix . '*');
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
     * @return array|string
     */
    abstract protected function serializeKey($key);

    /**
     * The load function overrides the base load function from DataLoader and extends it to support caching.
     * Given an array of parameters, it should return a promise that when resolved, return the value from
     * the batch function. If promise is already in cache, create an already fulfilled promise with value
     * from cache to immediatly get it.
     *
     * @param mixed $key An array of parameters (e.g ["proposal" => $proposal, "step" => $step, "includeUnpublished" => false]) or a keyName
     * @return mixed
     *
     * @see DataLoader
     * @throws \Psr\Cache\InvalidArgumentException
     */
    public function load($key)
    {
        $cacheKey = $this->getCacheKeyFromKey($key);
        $cacheItem = $this->cache->getItem($cacheKey)->expiresAfter($this->cacheTtl);
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
