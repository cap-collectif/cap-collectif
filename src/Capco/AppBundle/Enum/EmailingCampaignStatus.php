<?php

namespace Capco\AppBundle\Enum;

class EmailingCampaignStatus
{
    public const DRAFT = 'DRAFT';
    public const SENDING = 'SENDING';
    public const SENT = 'SENT';
    public const PLANNED = 'PLANNED';
    public const ARCHIVED = 'ARCHIVED';

    public const EDITABLE = [self::DRAFT, self::PLANNED];

    public const ALL = [self::DRAFT, self::SENDING, self::SENT, self::PLANNED, self::ARCHIVED];

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
            throw new \Exception("${value} is not a valid emailing campaign status");
        }
    }
}
