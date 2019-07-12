<?php

namespace Capco\AppBundle\Enum;

final class SubscriptionType
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
        return [self::ALL, self::ESSENTIAL, self::ESSENTIAL];
    }
}
