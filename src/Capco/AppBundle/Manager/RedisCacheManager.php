<?php
namespace Capco\AppBundle\Manager;

use Predis\ClientInterface;
use Symfony\Component\Cache\Adapter\RedisAdapter;

class RedisCacheManager extends RedisAdapter
{
    private $client;

    public function __construct(
        ClientInterface $redisClient,
        string $namespace = '',
        int $defaultLifetime = 0
    ) {
        parent::__construct($redisClient, $namespace, $defaultLifetime);
        $this->client = $redisClient;
    }

    public function getKeysByPattern(string $pattern): array
    {
        return $this->client->keys($pattern);
    }
}
