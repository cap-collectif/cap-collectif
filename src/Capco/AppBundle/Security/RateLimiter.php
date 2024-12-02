<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Cache\RedisCache;
use Psr\Cache\InvalidArgumentException;
use Psr\Log\LoggerInterface;

class RateLimiter
{
    final public const USER_CACHE_KEY = 'rateLimiterCacheKey';
    final public const LIMIT_REACHED = 'RATE_LIMIT_REACHED';

    private int $limit = 10;

    public function __construct(private readonly RedisCache $cache, private readonly LoggerInterface $logger)
    {
    }

    public function setLimit(int $limit): self
    {
        $this->limit = $limit;

        return $this;
    }

    /**
     * @param string $identifier For example, $user->getId() or $request->getClientIp()
     */
    public function canDoAction(string $action, string $identifier): bool
    {
        // TODO in upgrade of Symfony https://symfony.com/doc/current/rate_limiter.html
        // @var CacheItem $cachedItem
        try {
            $cacheKey = self::USER_CACHE_KEY . '-' . $action . '-' . $identifier;

            // Remove Redis cache reserved characters
            $cacheKey = str_replace(['{', '}', '(', ')', '/', '\\', '@', ':'], '', $cacheKey);

            $cachedItem = $this->cache->getItem($cacheKey);
        } catch (InvalidArgumentException $e) {
            $this->logger->warning('Rate limiter cache exception: ' . $e->getMessage());
            // In case of problem with cache system, we do not block the underlying functionality.
            return true;
        }
        $valueItem = $cachedItem->get();

        // first try
        if (!$cachedItem->isHit()) {
            $cachedItem->set(1)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);

            return true;
        }
        if (self::LIMIT_REACHED === $valueItem) {
            return false;
        }
        if ($valueItem < $this->limit) {
            $cachedItem->set($valueItem + 1);
            $this->cache->save($cachedItem);

            return true;
        }

        $cachedItem->set(self::LIMIT_REACHED)->expiresAfter(5 * RedisCache::ONE_MINUTE);
        $this->cache->save($cachedItem);

        return false;
    }
}
