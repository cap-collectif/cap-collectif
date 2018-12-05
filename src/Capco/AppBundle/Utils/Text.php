<?php

namespace Capco\AppBundle\Utils;

final class Text
{
    public static function escapeHtml($str): string
    {
        return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE);
    }

    public static function random(int $length = 10)
    {
        return substr(
            str_shuffle(
                str_repeat(
                    $x = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
                    ceil($length / \strlen($x))
                )
            ),
            1,
            $length
        );
    }

    public static function htmlToString($str): string
    {
        $str = html_entity_decode(strip_tags($str), ENT_QUOTES);

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
        $str = lcfirst($str);

        return $str;
    }

    public static function snakeCase(string $str): string
    {
        $separatorPattern = '/((?<=[^$])[A-Z0-9])/u';

        return strtolower(preg_replace($separatorPattern, '_$1', $str));
    }
}
