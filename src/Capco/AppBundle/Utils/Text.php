<?php
/**
 * Created by PhpStorm.
 * User: jeff
 * Date: 22/09/2017
 * Time: 12:29.
 */

namespace Capco\AppBundle\Utils;

final class Text
{
    public static function escapeHtml($str): string
    {
        return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE);
    }
}
