<?php

namespace Capco\AppBundle\Enum;

class UpdateEmailingCampaignErrorCode implements EnumType
{
    public const ID_NOT_FOUND = 'ID_NOT_FOUND';
    public const NOT_EDITABLE = 'NOT_EDITABLE';
    public const TOO_LATE = 'TOO_LATE';
    public const DOUBLE_LIST = 'DOUBLE_LIST';
    public const MAILING_LIST_NOT_FOUND = "MAILING_LIST_NOT_FOUND";

    public const ALL = [self::ID_NOT_FOUND, self::NOT_EDITABLE, self::TOO_LATE, self::DOUBLE_LIST, self::MAILING_LIST_NOT_FOUND];

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
