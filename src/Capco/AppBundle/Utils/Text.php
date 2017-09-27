<?php

namespace Capco\AppBundle\Utils;

final class Text
{
    public static function escapeHtml($str): string
    {
        return strip_tags($str);
    }
}
