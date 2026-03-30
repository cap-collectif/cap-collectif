<?php

namespace Capco\AppBundle\Enum;

class ProjectTabType implements EnumType
{
    final public const PRESENTATION = 'PRESENTATION';
    final public const NEWS = 'NEWS';
    final public const EVENTS = 'EVENTS';
    final public const CUSTOM = 'CUSTOM';

    public static function isValid(mixed $value): bool
    {
        if (!\is_string($value)) {
            return false;
        }

        return \in_array($value, self::getAvailableTypes(), true);
    }

    /**
     * @return array<string>
     */
    public static function getAvailableTypes(): array
    {
        return [
            self::PRESENTATION,
            self::NEWS,
            self::EVENTS,
            self::CUSTOM,
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
