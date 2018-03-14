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
}
