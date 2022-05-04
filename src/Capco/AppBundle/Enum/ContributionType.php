<?php

namespace Capco\AppBundle\Enum;

final class ContributionType implements EnumType
{
    public const OPINION = 'OPINION';
    public const OPINIONVERSION = 'OPINIONVERSION';
    public const COMMENT = 'COMMENT';
    public const ARGUMENT = 'ARGUMENT';
    public const DEBATEARGUMENT = 'DEBATEARGUMENT';
    public const DEBATEANONYMOUSARGUMENT = 'DEBATEANONYMOUSARGUMENT';
    public const SOURCE = 'SOURCE';
    public const PROPOSAL = 'PROPOSAL';
    public const REPLY = 'REPLY';
    public const VOTE = 'VOTE';
    public const REPLY_ANONYMOUS = 'REPLY_ANONYMOUS';

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
            self::DEBATEANONYMOUSARGUMENT,
            self::SOURCE,
            self::PROPOSAL,
            self::REPLY,
            self::VOTE,
            self::REPLY_ANONYMOUS,
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
