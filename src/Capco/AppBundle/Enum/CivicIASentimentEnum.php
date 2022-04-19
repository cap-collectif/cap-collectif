<?php

namespace Capco\AppBundle\Enum;

class CivicIASentimentEnum implements EnumType
{
    const POSITIVE = 'positive';
    const NEUTRAL = 'neutral';
    const NEGATIVE = 'negative';

    const SENTIMENTS = [self::POSITIVE, self::NEUTRAL, self::NEGATIVE];

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
