<?php

namespace Capco\AppBundle\Enum;

class DeleteAccountByEmailErrorCode implements EnumType
{
    public const NON_EXISTING_EMAIL = 'NON_EXISTING_EMAIL';
    public const DELETION_DENIED = 'DELETION_DENIED';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::NON_EXISTING_EMAIL, self::DELETION_DENIED];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
