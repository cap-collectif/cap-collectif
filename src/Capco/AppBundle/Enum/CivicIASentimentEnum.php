<?php

namespace Capco\AppBundle\Enum;

class CivicIASentimentEnum implements EnumType
{
    public const POSITIVE = 'POSITIVE';
    public const NEUTRAL = 'NEUTRAL';
    public const NEGATIVE = 'NEGATIVE';
    public const MIXED = 'MIXED';

    public const SENTIMENTS = [self::POSITIVE, self::NEUTRAL, self::NEGATIVE, self::MIXED];

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return self::SENTIMENTS;
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
