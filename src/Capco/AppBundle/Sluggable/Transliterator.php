<?php

namespace Capco\AppBundle\Sluggable;

use Gedmo\Sluggable\Util\Urlizer;

class Transliterator
{
    /**
     * Generates a slug of the text after transliterating the UTF-8 string to ASCII.
     *
     * Uses transliteration tables to convert any kind of utf8 character.
     */
    public static function transliterate(string $text, string $separator = '-'): string
    {
        $result = Urlizer::transliterate($text, $separator);

        // If we could not find anything return a random id
        // To avoid empty slugs
        if (!$result || 0 === \strlen($result)) {
            return uniqid();
        }

        return $result;
    }
}
