<?php

namespace Capco\AppBundle\Enum;

class CivicIASentimentEnum implements EnumType
{
    final public const POSITIVE = 'POSITIVE';
    final public const NEUTRAL = 'NEUTRAL';
    final public const NEGATIVE = 'NEGATIVE';
    final public const MIXED = 'MIXED';

    final public const SENTIMENTS = [self::POSITIVE, self::NEUTRAL, self::NEGATIVE, self::MIXED];

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
