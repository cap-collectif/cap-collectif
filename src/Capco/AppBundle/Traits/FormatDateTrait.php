<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Utils\DateHelper;

trait FormatDateTrait
{
    public function getTime(\DateTimeInterface $dateTime): string
    {
        return $dateTime->format('H:i:s');
    }

    public function getLongDate(
        \DateTimeInterface $dateTime,
        string $locale,
        string $timezone,
        $format = \IntlDateFormatter::FULL
    ): string {
        $dateFormatter = new \IntlDateFormatter(
            $locale,
            $format,
            \IntlDateFormatter::NONE,
            DateHelper::clearTimeZone($timezone),
            \IntlDateFormatter::GREGORIAN
        );

        return $dateFormatter->format($dateTime->getTimestamp());
    }
}
