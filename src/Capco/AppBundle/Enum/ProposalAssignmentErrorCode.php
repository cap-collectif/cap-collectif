<?php

namespace Capco\AppBundle\Enum;

class ProposalAssignmentErrorCode implements EnumType
{
    public const ACCESS_DENIED_TO_REVOKE_SUPERVISOR = 'ACCESS_DENIED_TO_REVOKE_SUPERVISOR';
    public const ACCESS_DENIED_TO_ASSIGN_SUPERVISOR = 'ACCESS_DENIED_TO_ASSIGN_SUPERVISOR';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::ACCESS_DENIED_TO_REVOKE_SUPERVISOR, self::ACCESS_DENIED_TO_ASSIGN_SUPERVISOR];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
