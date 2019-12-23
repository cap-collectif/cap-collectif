<?php

namespace Capco\AppBundle\Enum;

final class ProposalSort implements EnumType
{
    public const OLD = 'old';
    public const LAST = 'last';
    public const VOTES = 'votes';
    public const LEAST_VOTE = 'least-votes';
    public const COMMENTS = 'comments';
    public const RANDOM = 'random';
    public const CHEAP = 'cheap';
    public const EXPENSIVE = 'expensive';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [
            self::OLD,
            self::LAST,
            self::VOTES,
            self::LEAST_VOTE,
            self::COMMENTS,
            self::RANDOM,
            self::CHEAP,
            self::EXPENSIVE
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
