<?php

namespace Capco\AppBundle\Enum;

final class OrderDirection
{
    public const ASC = 'ASC';
    public const DESC = 'DESC';

    public const SORT_DIRECTION = [
        self::ASC => 'asc',
        self::DESC => 'desc',
    ];

    public static function reverse(string $direction)
    {
        if (self::ASC === $direction) {
            return self::DESC;
        }

        return self::ASC;
    }
}
