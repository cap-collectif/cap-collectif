<?php

namespace Capco\AppBundle\Utils;

final class Text
{
    public static function escapeHtml($str): string
    {
        return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE);
    }
}
