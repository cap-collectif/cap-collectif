<?php

namespace Capco\AppBundle\Enum;

class ProjectAffiliation implements EnumType
{
    public const OWNER = 'OWNER';
    public const AUTHOR = 'AUTHOR';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::OWNER, self::AUTHOR];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
