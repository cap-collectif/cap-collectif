<?php

namespace Capco\AppBundle\Enum;

class OrganizationAffiliation
{
    public const ADMIN = 'admin';
    public const USER = 'user';

    public static function getAvailableTypes(): array
    {
        return [self::ADMIN, self::USER];
    }

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
