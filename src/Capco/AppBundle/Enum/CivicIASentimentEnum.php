<?php

namespace Capco\AppBundle\Enum;

class CivicIASentimentEnum implements EnumType
{
    const POSITIVE = 'POSITIVE';
    const NEUTRAL = 'NEUTRAL';
    const NEGATIVE = 'NEGATIVE';
    const MIXED = 'MIXED';

    const SENTIMENTS = [self::POSITIVE, self::NEUTRAL, self::NEGATIVE, self::MIXED];

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
