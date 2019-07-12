<?php

namespace Capco\AppBundle\Enum;

final class FollowerSubscriptionType implements EnumType
{
    public const ALL = 'ALL';
    public const ESSENTIAL = 'ESSENTIAL';
    public const MINIMAL = 'MINIMAL';

    public static function isValid(string $value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::ALL, self::ESSENTIAL, self::MINIMAL];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
