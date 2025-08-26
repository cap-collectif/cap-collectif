<?php

namespace Capco\AppBundle\Enum;

class LogActionType implements EnumType
{
    public const SHOW = 'SHOW';

    public const CREATE = 'CREATE';

    public const DELETE = 'DELETE';

    public const EDIT = 'EDIT';

    public const EXPORT = 'EXPORT';

    public static function isValid(mixed $value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    /**
     * @return string[]
     */
    public static function getAvailableTypes(): array
    {
        return [
            self::SHOW,
            self::CREATE,
            self::DELETE,
            self::EDIT,
            self::EXPORT,
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
