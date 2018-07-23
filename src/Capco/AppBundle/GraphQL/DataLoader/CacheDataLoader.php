<?php
namespace Capco\AppBundle\GraphQL\DataLoader;

use Psr\Cache\CacheItemPoolInterface;

class CacheDataLoader
{
    protected $cacheItemPool;

    public function __construct(CacheItemPoolInterface $cacheItemPool)
    {
        $this->cacheItemPool = $cacheItemPool;
    }

    protected function getCacheKeyNameByValue(string $value): string
    {
        return '-[' . base64_encode($value) . ']-';
    }
}
