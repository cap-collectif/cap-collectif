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
        return htmlspecialchars((string) $str, \ENT_QUOTES | \ENT_SUBSTITUTE);
    }

    public static function sanitizeFileName($dangerousFilename)
    {
        $dangerousCharacters = [' ', '"', "'", '&', '/', '\\', '?', '#'];

        // every forbidden character is replace by an underscore
        return str_replace($dangerousCharacters, '_', (string) $dangerousFilename);
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
        $str = html_entity_decode(strip_tags((string) $str), \ENT_QUOTES);

        return iconv('UTF-8', 'UTF-8//IGNORE', $str);
    }

    public static function htmlToCsvText(?string $str): string
    {
        if (null === $str || '' === $str) {
            return '';
        }

        $str = str_replace(["\r\n", "\r"], "\n", $str);
        $str = html_entity_decode($str, \ENT_QUOTES | \ENT_HTML5, 'UTF-8');
        $str = preg_replace_callback('/<ol\b[^>]*>(.*?)<\/ol>/is', static fn (array $matches) => self::formatHtmlList($matches[1], true), $str);
        $str = preg_replace_callback('/<ul\b[^>]*>(.*?)<\/ul>/is', static fn (array $matches) => self::formatHtmlList($matches[1], false), (string) $str);
        $str = preg_replace_callback('/<li\b[^>]*>(.*?)<\/li>/is', static fn (array $matches) => "\n- " . self::htmlListItemToText($matches[1]), (string) $str);
        $str = preg_replace('/<br\s*\/?>/i', "\n", (string) $str);
        $str = preg_replace('/<\/(p|div|section|article|header|footer|h[1-6]|blockquote|pre|tr)>/i', "\n", (string) $str);
        $str = preg_replace('/<(p|div|section|article|header|footer|h[1-6]|blockquote|pre|tr)\b[^>]*>/i', "\n", (string) $str);
        $str = html_entity_decode(strip_tags((string) $str), \ENT_QUOTES | \ENT_HTML5, 'UTF-8');
        $str = preg_replace('/\x{00A0}/u', ' ', $str);
        $str = preg_replace('/[ \t]+/', ' ', (string) $str);
        $str = preg_replace('/ *\n */', "\n", (string) $str);
        $str = preg_replace("/\n{3,}/", "\n\n", (string) $str);

        $text = iconv('UTF-8', 'UTF-8//IGNORE', trim((string) $str));

        return false === $text ? '' : $text;
    }

    public static function unslug(string $slug): string
    {
        return ucfirst(str_replace('-', ' ', $slug));
    }

    public static function camelCase(string $str, array $noStrip = []): string
    {
        // non-alpha and non-numeric characters become spaces
        $str = preg_replace('/[^a-z0-9' . implode('', $noStrip) . ']+/i', ' ', $str);
        $str = trim((string) $str);
        // uppercase the first character of each word
        $str = ucwords($str);
        $str = str_replace(' ', '', $str);

        return lcfirst($str);
    }

    public static function snakeCase(string $str): string
    {
        $separatorPattern = '/((?<=[^$])[A-Z0-9])/u';

        return strtolower((string) preg_replace($separatorPattern, '_$1', $str));
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

    private static function formatHtmlList(string $html, bool $ordered): string
    {
        preg_match_all('/<li\b[^>]*>(.*?)<\/li>/is', $html, $matches);

        $items = [];
        foreach ($matches[1] as $index => $item) {
            $text = self::htmlListItemToText($item);
            if ('' === $text) {
                continue;
            }

            $items[] = ($ordered ? ($index + 1) . '. ' : '- ') . $text;
        }

        return $items ? "\n" . implode("\n", $items) . "\n" : '';
    }

    private static function htmlListItemToText(string $html): string
    {
        $html = preg_replace('/<br\s*\/?>/i', "\n", $html);
        $text = html_entity_decode(strip_tags((string) $html), \ENT_QUOTES | \ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\x{00A0}/u', ' ', $text);
        $text = preg_replace('/[ \t]+/', ' ', (string) $text);
        $text = preg_replace('/ *\n */', "\n", (string) $text);

        return trim((string) $text);
    }
}
