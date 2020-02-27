<?php

namespace Capco\AppBundle\Enum;

final class ProposalAssessmentState implements EnumType
{
    public const EMPTY = 'EMPTY';
    public const IN_PROGRESS = 'IN_PROGRESS';
    public const FAVOURABLE = 'FAVOURABLE';
    public const UNFAVOURABLE = 'UNFAVOURABLE';
    public const TOO_LATE = 'TOO_LATE';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getDecisionalTypes(): array
    {
        return [self::FAVOURABLE, self::UNFAVOURABLE];
    }

    public static function getAvailableTypes(): array
    {
        return [
            self::EMPTY,
            self::IN_PROGRESS,
            self::FAVOURABLE,
            self::UNFAVOURABLE,
            self::TOO_LATE
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
