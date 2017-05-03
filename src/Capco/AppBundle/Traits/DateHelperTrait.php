<?php

namespace Capco\AppBundle\Traits;

trait DateHelperTrait
{
    public function extractDate($datetime)
    {
        return null !== $datetime ? $datetime->format('Ymd') : null;
    }

    public function getYear($datetime)
    {
        return null !== $datetime ? $datetime->format('Y') : null;
    }

    public function getMonth($datetime)
    {
        return null !== $datetime ? $datetime->format('m') : null;
    }

    public function getDay($datetime)
    {
        return null !== $datetime ? $datetime->format('d') : null;
    }

    public function isSameDate($dt1, $dt2)
    {
        return $this->extractDate($dt1) === $this->extractDate($dt2);
    }
}
