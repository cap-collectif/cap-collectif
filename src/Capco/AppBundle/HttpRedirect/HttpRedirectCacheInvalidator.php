<?php

namespace Capco\AppBundle\HttpRedirect;

use Capco\AppBundle\Cache\RedisCache;
use Psr\Log\LoggerInterface;

class HttpRedirectCacheInvalidator
{
    public function __construct(
        private readonly RedisCache $httpRedirectCache,
        private readonly LoggerInterface $logger
    ) {
    }

    public function invalidateAll(): void
    {
        try {
            $this->httpRedirectCache->clear();
        } catch (\Throwable $exception) {
            // Fail open: mutations should not fail when cache invalidation fails.
            $this->logger->warning('Http redirect cache invalidation failed.', [
                'exception' => $exception,
            ]);
        }
    }
}
