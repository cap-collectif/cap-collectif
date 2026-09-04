<?php

namespace Capco\AppBundle\Utils;

final class DateHelper
{
    public static function clearTimeZone(string $timezone): string
    {
        return explode(' ', $timezone)[0];
    }
}
