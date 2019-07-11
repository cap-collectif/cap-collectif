<?php

namespace Capco\AppBundle\Twig;

use Capco\UserBundle\Repository\UserTypeRepository;
use Capco\AppBundle\Cache\RedisCache;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class UserTypeExtension extends AbstractExtension
{
    public const CACHE_KEY = 'userTypes';
    protected $repo;
    protected $cache;

    public function __construct(UserTypeRepository $repo, RedisCache $cache)
    {
        $this->repo = $repo;
        $this->cache = $cache;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('user_type_list', [$this, 'getUserTypes'])];
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
