<?php

namespace Capco\AppBundle\Cache;

use Symfony\Component\Cache\Adapter\ArrayAdapter;

class SameRequestCache extends ArrayAdapter
{
    public function __construct(int $defaultLifetime = 0, bool $storeSerialized = true)
    {
        parent::__construct($defaultLifetime, $storeSerialized);
    }
}
