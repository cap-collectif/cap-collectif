<?php

namespace Capco\AppBundle\Cache;

use Predis\ClientInterface;
use Symfony\Component\Cache\Adapter\RedisAdapter;

class RedisCache extends RedisAdapter
{
    final public const ONE_MINUTE = 60;
    final public const ONE_HOUR = 3600;
    final public const ONE_DAY = 50400;

    private readonly ClientInterface $client;

    public function __construct(
        ClientInterface $redisClient,
        string $namespace = '',
        int $defaultLifetime = 0
    ) {
        parent::__construct($redisClient, $namespace, $defaultLifetime);
        $this->client = $redisClient;
    }
}
