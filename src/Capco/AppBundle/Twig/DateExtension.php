<?php

namespace Capco\AppBundle\Twig;

class DateExtension extends \Twig_Extension
{

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'capco_date_extension';
    }

    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('date_diff', array($this, 'getDatesDiff')),
            new \Twig_SimpleFilter('has_significant_diff', array($this, 'hasSignificantDiff')),
        );
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

    protected function getDiffInSeconds($firstDate, $secondDate, $absolute = false)
    {
        $diff = $firstDate->getTimestamp() - $secondDate->getTimestamp();
        return $absolute ? abs($diff) : $diff;

    }
}
