<?php

namespace Capco\AppBundle\Enum;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;

class LogActionType implements EnumType
{
    public const SHOW = 'SHOW';

    public const CREATE = 'CREATE';

    public const DELETE = 'DELETE';

    public const EDIT = 'EDIT';

    public const EXPORT = 'EXPORT';

    public static function isValid(mixed $value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    /**
     * @return string[]
     */
    public static function getAvailableTypes(): array
    {
        return [
            self::SHOW,
            self::CREATE,
            self::DELETE,
            self::EDIT,
            self::EXPORT,
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }

    public static function getTranslationKey(string $type): string
    {
        $translationKeys = [
            self::SHOW => BaseNormalizer::EXPORT_APP_LOG_SHOW_ACTION_TYPE,
            self::CREATE => BaseNormalizer::EXPORT_APP_LOG_CREATE_ACTION_TYPE,
            self::DELETE => BaseNormalizer::EXPORT_APP_LOG_DELETE_ACTION_TYPE,
            self::EDIT => BaseNormalizer::EXPORT_APP_LOG_EDIT_ACTION_TYPE,
            self::EXPORT => BaseNormalizer::EXPORT_APP_LOG_EXPORT_ACTION_TYPE,
        ];

        return $translationKeys[$type] ?? $type;
    }
}
