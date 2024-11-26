<?php

namespace Capco\AppBundle\Enum;

class ProjectHeaderType implements EnumType
{
    final public const THUMBNAIL = 'thumbnail';
    final public const FULL_WIDTH = 'full_width';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::THUMBNAIL, self::FULL_WIDTH];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
