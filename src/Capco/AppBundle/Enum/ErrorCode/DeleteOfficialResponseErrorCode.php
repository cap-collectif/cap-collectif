<?php

namespace Capco\AppBundle\Enum\ErrorCode;

use Capco\AppBundle\Enum\EnumType;

class DeleteOfficialResponseErrorCode implements EnumType
{
    public const ID_NOT_FOUND = 'ID_NOT_FOUND';

    public const ALL = [self::ID_NOT_FOUND];

    public static function isValid($value): bool
    {
        return \in_array($value, self::ALL, true);
    }

    public static function getAvailableTypes(): array
    {
        return self::ALL;
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::ALL);
    }

}
