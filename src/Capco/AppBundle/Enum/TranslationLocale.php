<?php

namespace Capco\AppBundle\Enum;

final class TranslationLocale implements EnumType
{
    public const EN_GB = 'en-GB';
    public const FR_FR = 'fr-FR';
    public const ES_ES = 'es-ES';
    public const DE_DE = 'de-DE';
    public const NL_NL = 'nl-NL';
    public const SV_SE = 'sv-SE';
    public const EU_EU = 'eu-EU';
    public const OC_OC = 'oc-OC';
    public const UR_IN = 'ur-IN';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailablePrefixes(): array
    {
        return array_map(function ($locale) {
            return explode('-', $locale)[0];
        }, self::getAvailableTypes());
    }

    public static function getAvailableTypes(): array
    {
        return [
            self::EN_GB,
            self::FR_FR,
            self::ES_ES,
            self::DE_DE,
            self::NL_NL,
            self::SV_SE,
            self::EU_EU,
            self::OC_OC,
            self::UR_IN,
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
