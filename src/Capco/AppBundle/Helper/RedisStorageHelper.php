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

    public function recomputeUserCounters(?User $user = null)
    {
        if ($user) {
            $this->redis->sadd('recalculate_user_counters', $user->getId());
        }
    }
}
