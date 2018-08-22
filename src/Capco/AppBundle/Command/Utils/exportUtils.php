<?php

namespace Capco\AppBundle\Command\Utils;

final class exportUtils
{
    public static function parseCellValue($value)
    {
        if (!\is_array($value)) {
            if (\is_bool($value)) {
                return true === $value ? 'Yes' : 'No';
            }

            return $value;
        }

        return $value;
    }
}
