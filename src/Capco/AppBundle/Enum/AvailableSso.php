<?php

namespace Capco\AppBundle\Enum;

final class AvailableSso implements EnumType
{
    public const FRANCE_CONNECT = 'FRANCE_CONNECT';
    public const FACEBOOK = 'FACEBOOK';
    public const SsoList = [
        self::FACEBOOK => 'Facebook',
        self::FRANCE_CONNECT => 'FranceConnect',
    ];

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::FRANCE_CONNECT, self::FACEBOOK];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
