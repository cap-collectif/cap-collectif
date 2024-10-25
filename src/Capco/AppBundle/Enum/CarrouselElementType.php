<?php

namespace Capco\AppBundle\Enum;

class CarrouselElementType implements EnumType
{
    public const ARTICLE = 'article';
    public const EVENT = 'event';
    public const PROJECT = 'project';
    public const THEME = 'theme';
    public const CUSTOM = 'custom';

    /**
     * @param string $value
     */
    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    /**
     * @return array<string>
     */
    public static function getAvailableTypes(): array
    {
        return [
            self::ARTICLE,
            self::EVENT,
            self::PROJECT,
            self::THEME,
            self::CUSTOM,
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
