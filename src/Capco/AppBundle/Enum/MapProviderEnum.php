<?php

namespace Capco\AppBundle\Enum;

final class MapProviderEnum
{
    public const MAPBOX = 'MAPBOX';

    private static $providers = [self::MAPBOX];

    public static function isProviderValid(string $provider): bool
    {
        return \in_array($provider, static::$providers, true);
    }

    public static function getAvailableProviders(): array
    {
        return static::$providers;
    }
}
