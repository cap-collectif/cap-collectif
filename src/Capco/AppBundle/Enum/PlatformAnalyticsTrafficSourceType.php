<?php

namespace Capco\AppBundle\Enum;

final class PlatformAnalyticsTrafficSourceType implements EnumType
{
    public const SEARCH_ENGINE = 'SEARCH_ENGINE';
    public const DIRECT = 'DIRECT';
    public const EXTERNAL_LINK = 'EXTERNAL_LINK';
    public const SOCIAL_NETWORK = 'SOCIAL_NETWORK';
    public const EMAIL = 'EMAIL';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [
            self::SEARCH_ENGINE,
            self::DIRECT,
            self::EXTERNAL_LINK,
            self::SOCIAL_NETWORK,
            self::EMAIL
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
