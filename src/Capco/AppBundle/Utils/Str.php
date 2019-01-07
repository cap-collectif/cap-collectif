<?php

namespace Capco\AppBundle\Utils;

class Str
{
    public static function isBase64($string): bool
    {
        if (base64_encode(base64_decode($string, true)) === $string) {
            return true;
        }

        return false;
    }
}
