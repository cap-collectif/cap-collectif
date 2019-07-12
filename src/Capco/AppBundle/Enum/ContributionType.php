<?php

namespace Capco\AppBundle\Enum;

final class ContributionType
{
    public const OPINION = 'OPINION';
    public const OPINIONVERSION = 'OPINIONVERSION';
    public const COMMENT = 'COMMENT';
    public const ARGUMENT = 'ARGUMENT';
    public const SOURCE = 'SOURCE';
    public const PROPOSAL = 'PROPOSAL';
    public const REPLY = 'REPLY';

    public static function isValid(string $value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [
            self::OPINION,
            self::OPINIONVERSION,
            self::COMMENT,
            self::ARGUMENT,
            self::SOURCE,
            self::PROPOSAL,
            self::REPLY
        ];
    }
}
