<?php

namespace Capco\AppBundle\Utils;

final class Text
{
    public static function escapeHtml($str): string
    {
        return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE);
    }

    public static function htmlToString($str): string
    {
        $str = html_entity_decode(strip_tags($str), ENT_QUOTES);

        return iconv('UTF-8', 'UTF-8//IGNORE', $str);
    }

    public static function unslug(string $slug)
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
}
