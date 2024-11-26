<?php

namespace Capco\AppBundle\Enum;

use GraphQL\Error\UserError;

class ForOrAgainstType
{
    final public const AGAINST = 'AGAINST';
    final public const FOR = 'FOR';

    final public const ALL = [self::AGAINST, self::FOR];

    public static function isValid(string $value): bool
    {
        return \in_array($value, self::ALL, true);
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::ALL);
    }

    public static function checkIsValid(string $value): void
    {
        if (!self::isValid($value)) {
            throw new UserError("either FOR or AGAINST, not {$value}");
        }
    }
}
