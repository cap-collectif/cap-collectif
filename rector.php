<?php

use Rector\Caching\ValueObject\Storage\FileCacheStorage;
use Rector\Config\RectorConfig;
use Rector\Php81\Rector\Array_\FirstClassCallableRector;
use Rector\Set\ValueObject\SetList;

return RectorConfig::configure()
    ->withCache(
        cacheDirectory: __DIR__ . '/var/cache/rector',
        cacheClass: FileCacheStorage::class
    )
    ->withPaths([
        'src',
        'tests',
        'spec',
    ])
    ->withSkip([
        FirstClassCallableRector::class => [
            'src/Capco/AppBundle/Sluggable/SluggableListener.php',
        ],
    ])
    ->withSets([
        SetList::PHP_81,
    ])
;
