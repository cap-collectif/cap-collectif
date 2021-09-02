<?php

namespace Capco\AppBundle\Enum;

class EmailingCampaignInternalList
{
    public const REGISTERED = 'REGISTERED';
    public const NOT_CONFIRMED = 'NOT_CONFIRMED';
    public const CONFIRMED = 'CONFIRMED';

    public const ALL = [self::REGISTERED, self::NOT_CONFIRMED, self::CONFIRMED];

    public static function isValid(string $value): bool
    {
        return in_array($value, self::ALL, true);
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::ALL);
    }

    public static function checkIsValid(string $value): void
    {
        if (!self::isValid($value)) {
            throw new \Exception("$value is not a valid emailing campaign internal list");
        }
    }
}
