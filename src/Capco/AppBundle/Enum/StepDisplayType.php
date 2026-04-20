<?php

namespace Capco\AppBundle\Enum;

class StepDisplayType implements EnumType
{
    final public const BULLETTED_LIST = 'bulleted_list';
    final public const NUMBERED_LIST = 'numbered_list';

    public static function isValid(mixed $value): bool
    {
        return \is_string($value) && \in_array($value, self::getAvailableTypes(), true);
    }

    /**
     * @return array<string>
     */
    public static function getAvailableTypes(): array
    {
        return [self::BULLETTED_LIST, self::NUMBERED_LIST];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
