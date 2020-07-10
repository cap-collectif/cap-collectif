<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Cache\RedisCache;
use Capco\UserBundle\Repository\UserTypeRepository;
use Twig\Extension\RuntimeExtensionInterface;

class UserTypeRuntime implements RuntimeExtensionInterface
{
    public const CACHE_KEY = 'userTypes';
    protected $repo;
    protected $cache;

    public function __construct(UserTypeRepository $repo, RedisCache $cache)
    {
        $this->repo = $repo;
        $this->cache = $cache;
    }

    public function getUserTypes(): array
    {
        $cachedItem = $this->cache->getItem(self::CACHE_KEY);

        if (!$cachedItem->isHit()) {
            $data = $this->repo->findAllToArray();
            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }
}
