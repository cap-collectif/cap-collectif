<?php

namespace Capco\AppBundle\Traits;

trait DateHelperTrait
{
    public function extractDate(?\DateTime $datetime): ?string
    {
        return null !== $datetime ? $datetime->format('Ymd') : null;
    }

    public function getYear(?\DateTime $datetime): ?string
    {
        return null !== $datetime ? $datetime->format('Y') : null;
    }

    public function getMonth(?\DateTime $datetime): ?string
    {
        return null !== $datetime ? $datetime->format('m') : null;
    }

    public function getDay(?\DateTime $datetime): ?string
    {
        return null !== $datetime ? $datetime->format('d') : null;
    }

    public function isSameDate(?\DateTime $dt1, ?\DateTime $dt2): bool
    {
        return $this->extractDate($dt1) === $this->extractDate($dt2);
    }
}
