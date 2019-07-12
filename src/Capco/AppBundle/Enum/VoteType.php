<?php

namespace Capco\AppBundle\Enum;

final class VoteType
{
    public const DISABLED = 0;
    public const SIMPLE = 1;
    public const BUDGET = 2;

    public static function isValid(int $value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::DISABLED, self::SIMPLE, self::BUDGET];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
