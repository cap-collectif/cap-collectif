<?php

namespace Capco\AppBundle\Enum;

final class ReportingType implements EnumType
{
    public const SEX = 0;
    public const OFF = 1;
    public const SPAM = 2;
    public const ERROR = 3;
    public const OFF_TOPIC = 4;

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::SEX, self::OFF, self::SPAM, self::ERROR, self::OFF_TOPIC];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
