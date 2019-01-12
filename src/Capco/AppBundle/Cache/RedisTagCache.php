<?php

namespace Capco\AppBundle\Cache;

use Symfony\Component\Cache\Adapter\TagAwareAdapter;

class RedisTagCache extends TagAwareAdapter
{
    public function __construct(RedisCache $cache)
    {
        // When only one adapter is used, items and tags are all stored in the same place
        parent::__construct($cache);
    }
}
