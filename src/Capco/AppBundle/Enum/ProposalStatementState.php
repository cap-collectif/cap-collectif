<?php

namespace Capco\AppBundle\Enum;

final class ProposalStatementState implements EnumType
{
    public const IN_PROGRESS = 'IN_PROGRESS';
    public const FAVOURABLE = 'FAVOURABLE';
    public const UNFAVOURABLE = 'UNFAVOURABLE';
    public const TOO_LATE = 'TOO_LATE';
    public const NONE = 'NONE';
    public const DONE = 'DONE';
    public const TODO = 'TODO';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getDecisionalTypes(): array
    {
        return [self::FAVOURABLE, self::UNFAVOURABLE, self::NONE];
    }

    public static function getAvailableTypes(): array
    {
        return [
            self::IN_PROGRESS,
            self::FAVOURABLE,
            self::UNFAVOURABLE,
            self::TOO_LATE,
            self::DONE,
            self::NONE,
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
