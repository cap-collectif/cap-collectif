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

    protected function getCacheKeyNameByParameters(array $parameters): string
    {
        return '-[' . base64_encode(var_export($parameters, true)) . ']-';
    }
}
