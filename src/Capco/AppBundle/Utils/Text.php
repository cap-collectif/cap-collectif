<?php

namespace Capco\AppBundle\Utils;

final class Text
{
    public static function startsWith(string $haystack, string $needle): bool
    {
        // search backwards starting from haystack length characters from the end
        return '' === $needle || false !== strrpos($haystack, $needle, -\strlen($haystack));
    }

    public static function escapeHtml($str): string
    {
        return htmlspecialchars($str, \ENT_QUOTES | \ENT_SUBSTITUTE);
    }

    public static function sanitizeFileName($dangerousFilename)
    {
        $dangerousCharacters = [' ', '"', "'", '&', '/', '\\', '?', '#'];

        // every forbidden character is replace by an underscore
        return str_replace($dangerousCharacters, '_', $dangerousFilename);
    }

    public static function random(int $length = 10)
    {
        return substr(
            str_shuffle(
                str_repeat(
                    $x = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
                    (int) ceil($length / \strlen($x))
                )
            ),
            1,
            $length
        );
    }

    public static function htmlToString($str): string
    {
        $str = html_entity_decode(strip_tags($str), \ENT_QUOTES);

        return iconv('UTF-8', 'UTF-8//IGNORE', $str);
    }

    public static function unslug(string $slug): string
    {
        return ucfirst(str_replace('-', ' ', $slug));
    }

    public static function camelCase(string $str, array $noStrip = []): string
    {
        // non-alpha and non-numeric characters become spaces
        $str = preg_replace('/[^a-z0-9' . implode('', $noStrip) . ']+/i', ' ', $str);
        $str = trim($str);
        // uppercase the first character of each word
        $str = ucwords($str);
        $str = str_replace(' ', '', $str);

        return lcfirst($str);
    }

    public static function snakeCase(string $str): string
    {
        $separatorPattern = '/((?<=[^$])[A-Z0-9])/u';

        return strtolower(preg_replace($separatorPattern, '_$1', $str));
    }

    public static function rgbToHex(string $r, string $g, string $b): string
    {
        return sprintf('#%02x%02x%02x', $r, $g, $b);
    }

    public static function cleanNewline($value)
    {
        return \is_bool($value) ? $value : str_replace("\n", ' ', $value ?? '');
    }

    public static function isJSON(string $value): bool
    {
        return \is_array(json_decode($value, true)) && \JSON_ERROR_NONE == json_last_error()
            ? true
            : false;
    }
}
