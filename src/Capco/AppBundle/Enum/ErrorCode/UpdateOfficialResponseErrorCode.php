<?php

namespace Capco\AppBundle\Enum\ErrorCode;

use Capco\AppBundle\Enum\EnumType;

class UpdateOfficialResponseErrorCode implements EnumType
{
    final public const ID_NOT_FOUND = 'ID_NOT_FOUND';
    final public const NO_AUTHOR = 'NO_AUTHOR';
    final public const AUTHOR_NOT_FOUND = 'AUTHOR_NOT_FOUND';
    final public const PROPOSAL_NOT_FOUND = 'PROPOSAL_NOT_FOUND';
    final public const PROPOSAL_HAS_RESPONSE = 'PROPOSAL_HAS_RESPONSE';
    final public const INVALID_DATE = 'INVALID_DATE';
    final public const NOT_ADMIN = 'NOT_ADMIN';

    final public const ALL = [
        self::ID_NOT_FOUND,
        self::AUTHOR_NOT_FOUND,
        self::NO_AUTHOR,
        self::PROPOSAL_NOT_FOUND,
        self::PROPOSAL_HAS_RESPONSE,
        self::INVALID_DATE,
        self::NOT_ADMIN,
    ];

    public static function isValid($value): bool
    {
        return \in_array($value, self::ALL, true);
    }

    public static function getAvailableTypes(): array
    {
        return self::ALL;
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::ALL);
    }
}
