<?php

namespace Capco\AppBundle\Enum;

class ProposalStepErrorCode implements EnumType
{
    public const NO_VALID_STATUS = 'NO_VALID_STATUS';
    public const NO_VALID_PROPOSAL = 'NO_VALID_PROPOSAL';
    public const NO_VALID_STEP = 'NO_VALID_STEP';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [
            self::NO_VALID_STATUS,
            self::NO_VALID_PROPOSAL,
            self::NO_VALID_STEP,
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
