<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class DateExtension extends AbstractExtension
{
    public function getFilters(): array
    {
        return [
            new TwigFilter('date_diff', [$this, 'getDatesDiff']),
            new TwigFilter('has_significant_diff', [$this, 'hasSignificantDiff'])
        ];
    }

    public function getDatesDiff($firstDate, $secondDate, $absolute = true)
    {
        return $this->getDiffInSeconds($firstDate, $secondDate, $absolute);
    }

    public function hasSignificantDiff($firstDate, $secondDate, $maxDiff = 60): bool
    {
        $diff = $this->getDiffInSeconds($firstDate, $secondDate, true);

        return $diff > $maxDiff;
    }

    protected function getDiffInSeconds(
        \DateTime $firstDate,
        \DateTime $secondDate,
        $absolute = false
    ) {
        $diff = $firstDate->getTimestamp() - $secondDate->getTimestamp();

        return $absolute ? abs($diff) : $diff;
    }
}
