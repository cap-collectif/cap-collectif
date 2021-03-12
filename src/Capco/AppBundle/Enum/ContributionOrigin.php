<?php

namespace Capco\AppBundle\Enum;

class ContributionOrigin implements EnumType
{
    public const INTERNAL = 'INTERNAL';
    public const WIDGET = 'WIDGET';
    public const MAIL = 'MAIL';
    public const ALL_EXTERNAL = [self::WIDGET, self::MAIL];
    public const ALL = self::ALL_EXTERNAL + [self::INTERNAL];

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return self::ALL;
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
