<?php

namespace Capco\AppBundle\Enum;

final class MapTokenStyleVisibilityEnum
{
    public const PUBLIC = 'PUBLIC';
    public const PRIVATE = 'PRIVATE';

    private static $visibilities = [self::PUBLIC, self::PRIVATE];

    public static function isVisibilityValid(string $visibility): bool
    {
        return \in_array($visibility, static::$visibilities, true);
    }

    public static function getAvailableVisibilities(): array
    {
        return static::$visibilities;
    }
}
