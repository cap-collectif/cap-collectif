<?php

namespace Capco\AppBundle\Cache;

use Symfony\Component\Cache\Adapter\TagAwareAdapter;

class RedisTagCache extends TagAwareAdapter
{
    public function __construct(RedisCache $cache)
    {
        // Adapter for cached items, then for tags
        parent::__construct($cache, $cache);
    }
}
