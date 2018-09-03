<?php
namespace Capco\AppBundle\Helper;

use Capco\UserBundle\Entity\User;
use Predis\Client;

class RedisStorageHelper
{
    protected $redis;

    public function __construct(Client $redis)
    {
        $this->redis = $redis;
    }

    public function recomputeUserCounters(User $user = null): void
    {
        if ($user) {
            $this->redis->sadd('recalculate_user_counters', $user->getId());
        }
    }

    public function getValue(string $key): ?string
    {
        return $this->redis->get($key);
    }

    public function setValue(string $key, $value): void
    {
        $this->redis->set($key, $value);
    }

    public function deleteKey(string $key): void
    {
        $this->redis->del([$key]);
    }
}
