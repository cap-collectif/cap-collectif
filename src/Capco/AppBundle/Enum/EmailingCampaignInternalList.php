<?php

namespace Capco\AppBundle\Enum;

class EmailingCampaignInternalList
{
    final public const REGISTERED = 'REGISTERED';

    final public const ALL = [self::REGISTERED];

    public static function isValid(string $value): bool
    {
        return \in_array($value, self::ALL, true);
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::ALL);
    }

    public static function checkIsValid(string $value): void
    {
        if (!self::isValid($value)) {
            throw new \Exception("{$value} is not a valid emailing campaign internal list");
        }
    }
}
