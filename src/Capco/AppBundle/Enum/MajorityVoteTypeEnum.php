<?php

namespace Capco\AppBundle\Enum;

final class MajorityVoteTypeEnum implements EnumType
{
    public const VERY_WELL = 0;
    public const WELL = 1;
    public const WELL_ENOUGH = 2;
    public const PASSABLE = 3;
    public const NOT_PASSABLE = 4;
    public const REJECTED = 5;

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [
            self::VERY_WELL,
            self::WELL,
            self::WELL_ENOUGH,
            self::PASSABLE,
            self::NOT_PASSABLE,
            self::REJECTED,
        ];
    }

    public static function getCodeFromTranslationKey(string $translationKey): string
    {
        if ('very-well' === $translationKey) {
            return self::VERY_WELL;
        }
        if ('well' === $translationKey) {
            return self::WELL;
        }
        if ('global-well-enough' === $translationKey) {
            return self::WELL_ENOUGH;
        }
        if ('global-passable' === $translationKey) {
            return self::PASSABLE;
        }
        if ('global-not-passable' === $translationKey) {
            return self::NOT_PASSABLE;
        }
        if ('global-reject' === $translationKey) {
            return self::REJECTED;
        }

        return '';
    }

    public static function getI18nKeys(): array
    {
        return [
            'very-well',
            'global-well',
            'global-well-enough',
            'global-passable',
            'global-not-passable',
            'global-reject',
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }

    public static function toI18nKey(string $value): string
    {
        if ($value === (string) self::VERY_WELL) {
            return 'very-well';
        }
        if ($value === (string) self::WELL) {
            return 'global-well';
        }
        if ($value === (string) self::WELL_ENOUGH) {
            return 'global-well-enough';
        }
        if ($value === (string) self::PASSABLE) {
            return 'global-passable';
        }
        if ($value === (string) self::NOT_PASSABLE) {
            return 'global-not-passable';
        }
        if ($value === (string) self::REJECTED) {
            return 'global-reject';
        }

        return '';
    }

    public static function toString(string $value): string
    {
        if ($value === (string) self::VERY_WELL) {
            return 'VERY_WELL';
        }
        if ($value === (string) self::WELL) {
            return 'WELL';
        }
        if ($value === (string) self::WELL_ENOUGH) {
            return 'WELL_ENOUGH';
        }
        if ($value === (string) self::PASSABLE) {
            return 'PASSABLE';
        }
        if ($value === (string) self::NOT_PASSABLE) {
            return 'NOT_PASSABLE';
        }
        if ($value === (string) self::REJECTED) {
            return 'REJECTED';
        }

        return '';
    }
}
