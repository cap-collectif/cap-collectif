<?php

namespace Capco\AppBundle\Enum;

final class ContributionType implements EnumType
{
    public const OPINION = 'OPINION';
    public const OPINIONVERSION = 'OPINIONVERSION';
    public const COMMENT = 'COMMENT';
    public const ARGUMENT = 'ARGUMENT';
    public const DEBATEARGUMENT = 'DEBATEARGUMENT';
    public const DEBATE_ANONYMOUS_ARGUMENT = 'DEBATE_ANONYMOUS_ARGUMENT';
    public const SOURCE = 'SOURCE';
    public const PROPOSAL = 'PROPOSAL';
    public const REPLY = 'REPLY';
    public const VOTE = 'VOTE';

    public static function isValid($value): bool
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
            self::DEBATEARGUMENT,
            self::SOURCE,
            self::PROPOSAL,
            self::REPLY,
            self::VOTE,
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
