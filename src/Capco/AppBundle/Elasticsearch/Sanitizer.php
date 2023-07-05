<?php

namespace Capco\AppBundle\Elasticsearch;

/**
 * Taken from here and adapted it (mainly added typehing and removed custom exception)
 * https://github.com/sspat/es-query-sanitizer.
 */
class Sanitizer
{
    /**
     * Escapes reserved characters in a string.
     *
     * @param $query
     */
    public static function escape($query, ?array $exclude = null): string
    {
        self::ensureString($query);

        $reservedCharacters = self::reservedCharacters($exclude);

        return str_replace(array_keys($reservedCharacters), $reservedCharacters, $query);
    }

    /**
     * Checks if argument is a string.
     *
     * @param mixed $variable
     */
    protected static function ensureString($variable): void
    {
        if (\is_string($variable)) {
            return;
        }

        throw new \RuntimeException('Query must be a string');
    }

    /**
     * Returns array of ElasticSearch reserved characters.
     * Characters can be excluded from the result by passing them in the $exclude argument.
     *
     * @param null|string[] $excludeCharacters
     *
     * @return string[]
     */
    protected static function reservedCharacters(?array $excludeCharacters = null): array
    {
        $reservedCharacters = self::prepareReservedCharacters();

        if (\is_array($excludeCharacters)) {
            $reservedCharacters = self::excludeReservedCharacters(
                $reservedCharacters,
                $excludeCharacters
            );
        }

        return $reservedCharacters;
    }

    /**
     * Returns an array where the keys are the reserved characters/strings and the values are the
     * strings those characters/strings should be replaced/escaped with.
     *
     * @return string[]
     */
    protected static function prepareReservedCharacters(): array
    {
        return array_merge(
            array_combine(
                self::escapeWithSlashes(),
                array_map(function ($reservedString) {
                    return implode('', preg_filter('/^/', '\\', str_split($reservedString)));
                }, self::escapeWithSlashes())
            ),
            array_combine(
                self::replaceWithSpace(),
                array_fill(0, \count(self::replaceWithSpace()), '\ ')
            )
        );
    }

    /**
     * Returns array of reserved characters and strings each symbol of which should be escaped with a backslash.
     *
     * @return string[]
     */
    protected static function escapeWithSlashes(): array
    {
        return [
            '\\',
            '+',
            '-',
            '=',
            '&&',
            '||',
            '!',
            '(',
            ')',
            '{',
            '}',
            '[',
            ']',
            '^',
            '"',
            '~',
            '*',
            '?',
            ':',
            '/',
            'AND',
            'OR',
            'NOT',
            ' ',
        ];
    }

    /**
     * Returns array of reserved characters that should be replaced with a backslash-escaped space.
     * Such characters cannot be escaped in an ElasticSearch query string at all, so the only option is to remove them.
     *
     * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_reserved_characters
     *
     * @return string[]
     */
    protected static function replaceWithSpace(): array
    {
        return ['>', '<'];
    }

    /**
     * Excludes elements from the first array whose keys match an element in the second array.
     *
     * @param string[] $reservedCharacters
     * @param string[] $excludeCharacters
     *
     * @return string[]
     */
    protected static function excludeReservedCharacters(
        array $reservedCharacters,
        array $excludeCharacters
    ): array {
        return array_filter(
            $reservedCharacters,
            function ($reservedCharacter) use ($excludeCharacters) {
                return !\in_array($reservedCharacter, $excludeCharacters, true);
            },
            \ARRAY_FILTER_USE_KEY
        );
    }
}
