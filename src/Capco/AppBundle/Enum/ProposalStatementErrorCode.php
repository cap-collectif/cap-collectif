<?php

namespace Capco\AppBundle\Enum;

class ProposalStatementErrorCode implements EnumType
{
    final public const NON_EXISTING_PROPOSAL = 'NON_EXISTING_PROPOSAL';
    final public const NOT_ASSIGNED_PROPOSAL = 'NOT_ASSIGNED_PROPOSAL';
    final public const DECISION_ALREADY_GIVEN = 'DECISION_ALREADY_GIVEN';
    final public const NON_EXISTING_ASSESSMENT = 'NON_EXISTING_ASSESSMENT';
    final public const NON_EXISTING_ANALYSIS = 'NON_EXISTING_ANALYSIS';
    final public const INTERNAL_ERROR = 'INTERNAL_ERROR';
    final public const REFUSED_REASON_EMPTY = 'REFUSED_REASON_EMPTY';
    final public const INVALID_FORM = 'INVALID_FORM';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [
            self::NON_EXISTING_PROPOSAL,
            self::NOT_ASSIGNED_PROPOSAL,
            self::DECISION_ALREADY_GIVEN,
            self::NON_EXISTING_ASSESSMENT,
            self::INTERNAL_ERROR,
            self::REFUSED_REASON_EMPTY,
            self::NON_EXISTING_ANALYSIS,
            self::INVALID_FORM,
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
