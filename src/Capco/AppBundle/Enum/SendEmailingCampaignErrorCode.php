<?php

namespace Capco\AppBundle\Enum;

class SendEmailingCampaignErrorCode implements EnumType
{
    public const ID_NOT_FOUND = 'ID_NOT_FOUND';
    public const CANNOT_BE_SENT = 'CANNOT_BE_SENT';
    public const CANNOT_BE_CANCELED = 'CANNOT_BE_CANCELED';

    public const ALL = [self::ID_NOT_FOUND, self::CANNOT_BE_SENT, self::CANNOT_BE_CANCELED];

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
