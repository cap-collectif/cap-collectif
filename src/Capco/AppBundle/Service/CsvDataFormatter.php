<?php

namespace Capco\AppBundle\Service;

class CsvDataFormatter
{
    public function getNullableDatetime(?\DateTimeInterface $dateTime): ?string
    {
        return (null !== $dateTime) ? $dateTime->format('Y-m-d H:i:s') : null;
    }

    public function getReadableBoolean(bool|int|null $value): ?string
    {
        if (null === $value) {
            return null;
        }

        return $value ? 'Oui' : 'Non';
    }
}
