<?php

namespace Capco\AppBundle\Mailer\Enum;

use Capco\AppBundle\Mailer\Exception\MailerLogicException;

class EmailingCampaignInternalList
{
    final public const REGISTERED = 'REGISTERED';

    final public const ALL = [self::REGISTERED];

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
            throw new MailerLogicException(sprintf('%s is not a valid emailing campaign internal list', $value));
        }
    }
}
