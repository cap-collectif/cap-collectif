<?php

namespace Capco\AppBundle\Enum;

class EmailingCampaignAffiliation
{
    public const OWNER = 'OWNER';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::OWNER];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
