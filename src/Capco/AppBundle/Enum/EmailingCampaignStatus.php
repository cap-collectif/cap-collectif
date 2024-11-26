<?php

namespace Capco\AppBundle\Enum;

class EmailingCampaignStatus
{
    final public const DRAFT = 'DRAFT';
    final public const SENDING = 'SENDING';
    final public const SENT = 'SENT';
    final public const PLANNED = 'PLANNED';
    final public const ARCHIVED = 'ARCHIVED';

    final public const EDITABLE = [self::DRAFT, self::PLANNED];

    final public const ALL = [self::DRAFT, self::SENDING, self::SENT, self::PLANNED, self::ARCHIVED];

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
            throw new \Exception("{$value} is not a valid emailing campaign status");
        }
    }
}
