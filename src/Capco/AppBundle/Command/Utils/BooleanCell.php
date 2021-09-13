<?php

namespace Capco\AppBundle\Command\Utils;

class BooleanCell
{
    const YES = 'Yes';
    const NO = 'No';

    public static function toString(bool $value): string
    {
        return $value ? self::YES : self::NO;
    }
}
