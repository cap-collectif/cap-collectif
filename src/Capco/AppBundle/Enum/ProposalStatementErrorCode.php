<?php

namespace Capco\AppBundle\Enum;

class ProposalStatementErrorCode implements EnumType
{
    public const NON_EXISTING_PROPOSAL = 'NON_EXISTING_PROPOSAL';
    public const NOT_ASSIGNED_PROPOSAL = 'NOT_ASSIGNED_PROPOSAL';
    public const DECISION_ALREADY_GIVEN = 'DECISION_ALREADY_GIVEN';
    public const NON_EXISTING_ASSESSMENT = 'NON_EXISTING_ASSESSMENT';
    public const NON_EXISTING_ANALYSIS = 'NON_EXISTING_ANALYSIS';
    public const INTERNAL_ERROR = 'INTERNAL_ERROR';
    public const REFUSED_REASON_EMPTY = 'REFUSED_REASON_EMPTY';
    public const INVALID_FORM = 'INVALID_FORM';

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
