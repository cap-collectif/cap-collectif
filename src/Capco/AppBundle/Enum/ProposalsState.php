<?php

namespace Capco\AppBundle\Enum;

final class ProposalsState implements EnumType
{
    public const ALL = 'all';
    public const PUBLISHED = 'published';
    public const TRASHED = 'trashed';
    public const DRAFT = 'draft';
    public const ARCHIVED = 'archived';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::ALL, self::PUBLISHED, self::TRASHED, self::DRAFT];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
