<?php

namespace Capco\AppBundle\Enum;

class AnonymizeAccountByEmailErrorCode implements EnumType
{
    final public const NON_EXISTING_EMAIL = 'NON_EXISTING_EMAIL';
    final public const ANONYMIZATION_DENIED = 'ANONYMIZATION_DENIED';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::NON_EXISTING_EMAIL, self::ANONYMIZATION_DENIED];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
