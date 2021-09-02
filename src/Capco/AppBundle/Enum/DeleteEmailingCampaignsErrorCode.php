<?php

namespace Capco\AppBundle\Enum;

class DeleteEmailingCampaignsErrorCode implements EnumType
{
    public const ID_NOT_FOUND = 'ID_NOT_FOUND';
    public const EMPTY = 'EMPTY';

    public const ALL = [self::ID_NOT_FOUND, self::EMPTY];

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
