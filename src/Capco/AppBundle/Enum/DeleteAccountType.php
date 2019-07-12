<?php

namespace Capco\AppBundle\Enum;

final class DeleteAccountType implements EnumType
{
    public const SOFT = 'SOFT';
    public const HARD = 'HARD';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::SOFT, self::HARD];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
