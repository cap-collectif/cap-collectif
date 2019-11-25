<?php

namespace Capco\AppBundle\Enum;

final class TranslationLocale implements EnumType
{
    public const EN_GB = 'en-GB';
    public const FR_FR = 'fr-FR';
    public const ES_ES = 'es-ES';
    public const DE_DE = 'de-DE';
    public const NL_NL = 'nl-NL';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [self::EN_GB, self::FR_FR, self::ES_ES, self::DE_DE, self::NL_NL];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
