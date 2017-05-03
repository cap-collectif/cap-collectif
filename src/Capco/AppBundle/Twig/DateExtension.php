<?php

namespace Capco\AppBundle\Twig;

class DateExtension extends \Twig_Extension
{
    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('date_diff', [$this, 'getDatesDiff']),
            new \Twig_SimpleFilter('has_significant_diff', [$this, 'hasSignificantDiff']),
        ];
    }

    public function getDatesDiff($firstDate, $secondDate, $absolute = true)
    {
        return $this->getDiffInSeconds($firstDate, $secondDate, $absolute);
    }

    public function hasSignificantDiff($firstDate, $secondDate, $maxDiff = 60)
    {
        $diff = $this->getDiffInSeconds($firstDate, $secondDate, true);

        return $diff > $maxDiff;
    }

    protected function getDiffInSeconds(\DateTime $firstDate, \DateTime $secondDate, $absolute = false)
    {
        $diff = $firstDate->getTimestamp() - $secondDate->getTimestamp();

        return $absolute ? abs($diff) : $diff;
    }
}
