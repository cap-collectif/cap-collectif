<?php

namespace Capco\AppBundle\Enum;

class ProposalAssignmentErrorCode implements EnumType
{
    public const ACCESS_DENIED_TO_REVOKE_SUPERVISOR = 'ACCESS_DENIED_TO_REVOKE_SUPERVISOR';
    public const ACCESS_DENIED_TO_ASSIGN_SUPERVISOR = 'ACCESS_DENIED_TO_ASSIGN_SUPERVISOR';
    public const CANT_REVOKE_YOURSELF = 'CANT_REVOKE_YOURSELF';
    public const IN_PROGRESS_ANALYSIS_REVOKE_ANALYST_DENIED = 'IN_PROGRESS_ANALYSIS_REVOKE_ANALYST_DENIED';
    public const MAX_ANALYSTS_REACHED = 'MAX_ANALYSTS_REACHED';
    public const ACCESS_DENIED = 'ACCESS_DENIED';
    public const ACCESS_DENIED_TO_ASSIGN_ANALYST = 'ACCESS_DENIED_TO_ASSIGN_ANALYST';
    public const ANALYSTS_CANT_BE_EMPTY = 'ANALYSTS_CANT_BE_EMPTY';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [
            self::ACCESS_DENIED_TO_REVOKE_SUPERVISOR,
            self::ACCESS_DENIED_TO_ASSIGN_SUPERVISOR,
            self::CANT_REVOKE_YOURSELF,
            self::IN_PROGRESS_ANALYSIS_REVOKE_ANALYST_DENIED,
            self::ACCESS_DENIED,
            self::ACCESS_DENIED_TO_ASSIGN_ANALYST,
            self::MAX_ANALYSTS_REACHED,
            self::ANALYSTS_CANT_BE_EMPTY,
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
