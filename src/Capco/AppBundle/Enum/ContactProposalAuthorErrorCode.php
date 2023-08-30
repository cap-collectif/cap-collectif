<?php

namespace Capco\AppBundle\Enum;

class ContactProposalAuthorErrorCode implements EnumType
{
    public const NON_EXISTING_PROPOSAL = 'NON_EXISTING_PROPOSAL';
    public const NO_CONTACT_PROPOSAL = 'NO_CONTACT_PROPOSAL';
    public const INVALID_EMAIL_AUTHOR = 'INVALID_EMAIL_AUTHOR';
    public const INVALID_CAPTCHA = 'INVALID_CAPTCHA';
    public const SENDING_FAILED = 'SENDING_FAILED';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::NON_EXISTING_PROPOSAL, self::NO_CONTACT_PROPOSAL, self::INVALID_CAPTCHA];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
