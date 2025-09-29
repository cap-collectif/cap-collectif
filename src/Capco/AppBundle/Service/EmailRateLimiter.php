<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Exception\RecentlySentException;
use Psr\Log\LoggerInterface;
use Symfony\Component\Cache\CacheItem;
use Symfony\Component\HttpKernel\KernelInterface;

class EmailRateLimiter
{
    public function __construct(
        private readonly RedisCache $redis,
        private readonly LoggerInterface $logger,
        private readonly KernelInterface $kernel
    ) {
    }

    public function rateLimit(string $cacheKey, int $expiresAfterInSeconds = RedisCache::ONE_MINUTE): void
    {
        $env = $this->kernel->getEnvironment();

        if ('test' === $env) {
            return;
        }

        /** * @var CacheItem $cacheItem */
        $cacheItem = $this->redis->getItem($cacheKey);

        if ($cacheItem->isHit()) {
            $this->logger->warning('Email already sent less than a minute ago.');

            throw new RecentlySentException();
        }

        $cacheItem->expiresAfter($expiresAfterInSeconds);
        $this->redis->save($cacheItem);
    }
}
