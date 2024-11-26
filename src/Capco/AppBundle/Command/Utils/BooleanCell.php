<?php

namespace Capco\AppBundle\Command\Utils;

class BooleanCell
{
    final public const YES = 'Yes';
    final public const NO = 'No';

    public static function toString(bool $value): string
    {
        return $value ? self::YES : self::NO;
    }
}
