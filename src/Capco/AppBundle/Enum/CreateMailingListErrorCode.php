<?php

namespace Capco\AppBundle\Enum;

class CreateMailingListErrorCode implements EnumType
{
    public const ID_NOT_FOUND_USER = 'ID_NOT_FOUND_USER';
    public const ID_NOT_FOUND_PROJECT = 'ID_NOT_FOUND_PROJECT';
    public const EMPTY_USERS = 'EMPTY_USERS';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::ID_NOT_FOUND_USER, self::ID_NOT_FOUND_PROJECT, self::EMPTY_USERS];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
