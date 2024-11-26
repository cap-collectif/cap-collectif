<?php

namespace Capco\AppBundle\Helper;

use Closure;

/**
 * Class EnvHelper.
 *
 * Many things of this helper comes from Laravel.
 */
class EnvHelper
{
    /**
     * Gets the value of an environment variable. Supports boolean, empty and null.
     *
     * @return mixed
     */
    public static function get(string $key)
    {
        $value = getenv($key);

        if (false === $value) {
            return $value instanceof Closure ? $value() : $value;
        }

        switch (strtolower($value)) {
            case 'true':
            case '(true)':
                return true;

            case 'false':
            case '(false)':
                return false;

            case 'empty':
            case '(empty)':
                return '';

            case 'null':
            case '(null)':
                return;
        }

        if (\strlen($value) > 1 && self::startsWith($value, '"') && self::endsWith($value, '"')) {
            return substr($value, 1, -1);
        }

        return $value;
    }

    /**
     * Determine if a given string starts with a given substring.
     *
     * @param array|string $needles
     */
    private static function startsWith(string $haystack, $needles): bool
    {
        foreach ((array) $needles as $needle) {
            if ('' !== $needle && substr($haystack, 0, \strlen((string) $needle)) === (string) $needle) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine if a given string ends with a given substring.
     *
     * @param array|string $needles
     */
    private static function endsWith(string $haystack, $needles): bool
    {
        foreach ((array) $needles as $needle) {
            if (substr($haystack, -\strlen((string) $needle)) === (string) $needle) {
                return true;
            }
        }

        return false;
    }
}
