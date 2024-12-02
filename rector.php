<?php

use Rector\Caching\ValueObject\Storage\FileCacheStorage;
use Rector\Config\RectorConfig;
use Rector\Php71\Rector\FuncCall\RemoveExtraParametersRector;
use Rector\Php80\Rector\Class_\ClassPropertyAssignToConstructorPromotionRector;
use Rector\Php81\Rector\Array_\FirstClassCallableRector;
use Rector\Php81\Rector\Property\ReadOnlyPropertyRector;
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
        'src/Capco/AppBundle/GraphQL/__generated__',
        ClassPropertyAssignToConstructorPromotionRector::class => [
            'src/Capco/AppBundle/Entity/ProposalSupervisor.php',
            'src/Capco/AppBundle/Entity/ProposalDecisionMaker.php',
        ],
        ReadOnlyPropertyRector::class => [
            'src/Capco/AppBundle/Twig/MediaExtension.php',
            'src/Capco/AppBundle/GraphQL/Resolver/Media/MediaUrlResolver.php',
            'src/Capco/AppBundle/Mailer/Message/MessageRecipient.php',
            'src/Capco/UserBundle/Facebook/FacebookResourceOwner.php',
            'src/Capco/UserBundle/Security/Http/Logout/Handler/SAMLLogoutHandler.php',
            'src/Capco/UserBundle/Authenticator/SimplePreAuthenticator.php',
        ],
        FirstClassCallableRector::class => [
            'src/Capco/AppBundle/Sluggable/SluggableListener.php',
        ],
        RemoveExtraParametersRector::class => [
            'spec/Capco/AppBundle/GraphQL/Resolver/GlobalIdResolverSpec.php',
        ],
    ])
    ->withSets([
        SetList::PHP_81,
        SetList::PHP_80,
        SetList::PHP_74,
        SetList::PHP_71,
        SetList::PHP_70,
        SetList::PHP_55,
        SetList::PHP_53,
    ])
;
