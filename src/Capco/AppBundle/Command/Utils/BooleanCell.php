<?php

namespace Capco\AppBundle\Command\Utils;

class BooleanCell
{
    public const YES = 'Yes';
    public const NO = 'No';

    public static function toString(bool $value): string
    {
        return $value ? self::YES : self::NO;
    }
}
